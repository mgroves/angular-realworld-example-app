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
  // rawData: string = '';
  // tag: string = '';
  isGenerateSummaryLoading: boolean = false;
  loadingMessages = [
    "Hi, I'm summary-bot! I'll create something cool with the data you're working on.",
    "I'm working on your content now...",
    "Someone forgot to oil the robots...",
    "Just a bit longer, I'm not a coffee machine you know...",
    "Insert clever banter here...",
    "Brewing up some fresh pixels...",
    "Just loading, or maybe contemplating existence...",
    "Turning 1s and 0s into something cool...",
    "Patience is a virtue, loading is a test...",
  ];
  currentMessage = '';

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
    this.changeMessage();
    const postData = { rawData: "", tag: "" };
    //const postData = { rawData: this.rawData, tag: this.tag };
    const url = environment.api_url + '/articles/generateSummary';

    this.http.post(url, postData).subscribe({
      next: (response: any) => {
        this.isGenerateSummaryLoading = false;
        this.currentMessage = '';
        console.log(response.slug);
        this.cd.detectChanges();
      },
      error: (error) => {
        this.isGenerateSummaryLoading = false;
        this.currentMessage = '';
        console.error('There was an error!', error);
        this.cd.detectChanges();
      }
    });
  }

  changeMessage() {
    let messageIndex = 0;
    this.currentMessage = this.loadingMessages[messageIndex++];
    const messageInterval = setInterval(() => {
      if (!this.isGenerateSummaryLoading || messageIndex >= this.loadingMessages.length) {
        clearInterval(messageInterval);
        return;
      }
      this.currentMessage = this.loadingMessages[messageIndex++];
      this.cd.detectChanges();
      if(messageIndex >= this.loadingMessages.length) {
        messageIndex = 0;
      }
    }, 6000); // Change message every 3 seconds
  }
}


