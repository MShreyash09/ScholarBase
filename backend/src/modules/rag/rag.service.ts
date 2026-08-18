import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../../prisma/prisma.service";
import { StorageService, PAPERS_BUCKET } from "../storage/storage.service";
import { Pinecone } from "@pinecone-database/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "@langchain/core/documents";
const pdfParse = require("pdf-parse");
import { IngestionStatus } from "@prisma/client";

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private pinecone: Pinecone;
  private embeddings: GoogleGenerativeAIEmbeddings;
  private indexName: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly config: ConfigService,
  ) {
    const pineconeApiKey = this.config.get<string>("PINECONE_API_KEY");
    this.indexName = this.config.get<string>("PINECONE_INDEX", "scholarbase");
    const geminiApiKey = this.config.get<string>("GEMINI_API_KEY");

    if (pineconeApiKey && pineconeApiKey !== "dummy") {
      this.pinecone = new Pinecone({ apiKey: pineconeApiKey });
    }
    
    if (geminiApiKey && geminiApiKey !== "dummy") {
      this.embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: geminiApiKey,
        model: "text-embedding-004", // Free tier embedding model
      });
    }
  }

  async ingestPaper(paperId: string): Promise<void> {
    if (!this.pinecone || !this.embeddings) {
      this.logger.warn("RAG credentials not configured. Skipping ingestion.");
      return;
    }

    try {
      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.queued },
      });

      const paper = await this.prisma.questionPaper.findUnique({
        where: { id: paperId },
        include: { subject: true },
      });

      if (!paper) {
        throw new Error(`Paper ${paperId} not found`);
      }

      this.logger.log(`Fetching PDF for paper ${paper.id}...`);
      const buffer = await this.storage.getObjectBuffer(PAPERS_BUCKET, paper.fileKey);

      this.logger.log(`Parsing PDF for paper ${paper.id}...`);
      const parsed = await pdfParse(buffer);
      const text = parsed.text;

      this.logger.log(`Chunking text for paper ${paper.id}...`);
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });

      const docs = await splitter.createDocuments([text], [{
        paperId: paper.id,
        subjectId: paper.subjectId,
        subjectCode: paper.subject.code,
        subjectName: paper.subject.name,
        academicYear: paper.academicYear,
        fileName: paper.fileName,
      }]);

      this.logger.log(`Generating embeddings and uploading to Pinecone for ${docs.length} chunks...`);
      const pineconeIndex = this.pinecone.Index(this.indexName);
      
      // Batch upsert to pinecone
      const batchSize = 100;
      for (let i = 0; i < docs.length; i += batchSize) {
        const batch = docs.slice(i, i + batchSize);
        const embedded = await this.embeddings.embedDocuments(batch.map((d: Document) => d.pageContent));
        
        const vectors = batch.map((doc: Document, idx: number) => ({
          id: `${paper.id}-chunk-${i + idx}`,
          values: embedded[idx],
          metadata: {
            ...doc.metadata,
            text: doc.pageContent,
          },
        }));

        await pineconeIndex.upsert(vectors as any);
      }

      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.ingested },
      });

      this.logger.log(`Successfully ingested paper ${paper.id}`);
    } catch (error) {
      this.logger.error(`Failed to ingest paper ${paperId}`, error);
      await this.prisma.questionPaper.update({
        where: { id: paperId },
        data: { ingestionStatus: IngestionStatus.failed },
      });
    }
  }

  async retrieveContext(query: string, k: number = 3): Promise<string> {
    if (!this.pinecone || !this.embeddings) {
      return "";
    }

    try {
      const queryEmbedding = await this.embeddings.embedQuery(query);
      const pineconeIndex = this.pinecone.Index(this.indexName);

      const queryResponse = await pineconeIndex.query({
        vector: queryEmbedding,
        topK: k,
        includeMetadata: true,
      });

      if (!queryResponse.matches || queryResponse.matches.length === 0) {
        return "";
      }

      const contexts = queryResponse.matches.map(match => {
        const meta = match.metadata as any;
        return `[Source: ${meta.subjectName} (${meta.subjectCode}), Year: ${meta.academicYear}]\n${meta.text}`;
      });

      return contexts.join("\n\n---\n\n");
    } catch (error) {
      this.logger.error("Failed to retrieve context from Pinecone", error);
      return "";
    }
  }
}
