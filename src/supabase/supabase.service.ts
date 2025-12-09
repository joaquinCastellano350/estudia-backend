import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private client;
  constructor() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_KEY;
    if (!url || !key) {
      throw new Error(
        'Supabase URL or Key is not defined in environment variables',
      );
    }
    this.client = createClient(url, key);
  }
  getClient() {
    return this.client;
  }
}
