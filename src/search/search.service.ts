import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

type SearchHit =
  | {
      type: 'annotation';
      id: string;
      documentId: string;
      title: string | null;
      snippet: string;
      rank: number;
      createdAt: string;
    }
  | {
      type: 'document';
      id: string;
      name: string;
      snippet: string;
      rank: number;
      createdAt: string;
    };

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}
  async search(
    userId: string,
    query: string,
    limit = 20,
  ): Promise<SearchHit[]> {
    const q = query.trim();
    if (!q) return [];
    const annotationHits = await this.prisma.$queryRaw<SearchHit[]>`
      SELECT
        'annotation' as type,
        a.id,
        a.document_id as "documentId",
        a.title,
        ts_headline('spanish', coalesce(a.content,''), plainto_tsquery('spanish', ${q}),
          'MaxWords=25, MinWords=10, ShortWord=2, HighlightAll=true'
        ) as snippet,
        ts_rank(a.search_vector, plainto_tsquery('spanish', ${q})) as rank,
        a.created_at::text as "createdAt"
        from public.annotation a
        where a.user_id = ${userId}
        and a.search_vector @@ plainto_tsquery('spanish', ${q})
        order by rank desc
        limit ${limit};
      `;
    const documentHits = await this.prisma.$queryRaw<SearchHit[]>`
      SELECT
        'document' as type,
        d.id,
        d.name,
        ts_headline('spanish', coalesce(d.name,''), plainto_tsquery('spanish', ${q}),
          'MaxWords=25, MinWords=10, ShortWord=2, HighlightAll=true'
        ) as snippet,
        ts_rank(d.search_vector, plainto_tsquery('spanish', ${q})) as rank,
        d.created_at::text as "createdAt"
        from public.document d
        where d.user_id = ${userId}
        and d.search_vector @@ plainto_tsquery('spanish', ${q})
        order by rank desc
        limit ${limit};
      `;
    const hits = [...annotationHits, ...documentHits];
    hits.sort((a, b) => (b.rank ?? 0) - (a.rank ?? 0));
    return hits.slice(0, limit);
  }
}
