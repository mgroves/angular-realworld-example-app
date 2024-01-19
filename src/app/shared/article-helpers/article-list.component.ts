import { Component, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Article, ArticleListConfig, ArticlesService } from '../../core';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-article-list',
  styleUrls: ['article-list.component.css'],
  templateUrl: './article-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArticleListComponent {
  constructor (
    private articlesService: ArticlesService,
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}


  @Input() showAdaptiveDashboard: boolean;
  @Input() limit: number;
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;
      this.currentPage = 1;
      this.runQuery();
    }
  }

  // for summary generator
  rawData: string = '';
  tag: string = '';
  isGenerateSummaryLoading: boolean = false;

  query: ArticleListConfig;
  results: Article[];
  loading = false;
  currentPage = 1;
  totalPages: Array<number> = [1];

  setPageTo(pageNumber) {
    this.currentPage = pageNumber;
    this.runQuery();
  }

  trackByFn(index, item) {
    return index;
  }

  runQuery() {
    this.loading = true;
    this.results = [];

    // Create limit and offset filter (if necessary)
    if (this.limit) {
      this.query.filters.limit = this.limit;
      this.query.filters.offset =  (this.limit * (this.currentPage - 1));
    }

    this.articlesService.query(this.query)
    .subscribe(data => {
      this.loading = false;
      this.results = data.articles;

      // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
      this.totalPages = Array.from(new Array(Math.ceil(data.articlesCount / this.limit)), (val, index) => index + 1);
      this.cd.markForCheck();
    });
  }

  sendPostRequest() {
    this.isGenerateSummaryLoading = true;
    const postData = { rawData: this.rawData, tag: this.tag };
    const url = environment.api_url + '/api/articles/generateSummary';

    this.http.post(url, postData).subscribe({
      next: (response: any) => {
        this.isGenerateSummaryLoading = false;
        console.log(response.slug);
        //this.responseMessage = response.message;
        this.cd.detectChanges();
      },
      error: (error) => {
        this.isGenerateSummaryLoading = false;
        console.error('There was an error!', error);
        this.cd.detectChanges();
      }
    });
  }
}


