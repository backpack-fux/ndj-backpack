import {News} from '@app/models';
import {mapDecryptNews} from '@app/utils';
import axios from 'axios';

class NewsService {
  private DECRYPT_BASE_ENDPOINT =
    'https://api.decrypt.co/content-elasticsearch/posts?_minimal=true&category=news&lang=en-US&order=desc&orderby=date';

  public async getNews(offset: number, limit: number): Promise<Array<News>> {
    try {
      const decryptNews: Array<News> = await this.getDecryptNews(offset, limit);

      // TODO: attach other news platform

      return [...decryptNews];
    } catch (error) {
      return [];
    }
  }

  private async getDecryptNews(offset: number, limit: number): Promise<News[]> {
    const {data = []}: any = await axios.get(
      `${this.DECRYPT_BASE_ENDPOINT}&offset=${offset}&per_page=${limit}`,
    );
    return data.map(mapDecryptNews);
  }
}

export const newsService = new NewsService();
