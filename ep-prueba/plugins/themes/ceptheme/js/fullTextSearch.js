const fullTextSearch = new Vue({
  components: {
    DatePicker,
  },
  delimiters: ["[[", "]]"],
  el: "#fullTextSearch",
  data: {
    title: "Full Text Search",
    isSearchPage: isSearchPage ? true : false,
    verticalLayout: false,
    model: {
      searchString: "",
      advanced: [
        {
          fieldType: "all",
          fieldValue: "",
          fieldOperator: "and",
          searchType: "fullText",
        },
      ],
      dateFilter: {
        value: "all",
        dateRange: [new Date(), new Date()],
      },
      nextPage: 1,
      hitsPerPage: 5,
      isAdvanced: false,
    },
    dateRange: {
      from: new Date(),
      to: new Date(),
    },
    searchResults: [],
    totalResults: 0,
    totalPages: 0,
    currentPage: 0,
    currentLocale: currentLocale,
    loader: false,
    fullTextFields: ["title", "abstract", "authors", "all", "article_content"],
  },
  created() {
    // if (!this.isSearchPage && window.innerWidth < 768) {
    //   this.verticalLayout = true;
    // }
    this.setLayout();
    window.addEventListener("resize", this.setLayout);

    try {
      const params = window.location.search.split("&");
      const query = params[0].split("=");
      query[0] = query[0].replace("?", "");
      if (query[0] == "query") {
        try {
          const searchQuery = atob(query[1]);
          this.model = JSON.parse(searchQuery);
          if (this.model.dateFilter.value == "range") {
            const start = this.model.dateFilter.dateRange[0];
            const end = this.model.dateFilter.dateRange[1];
            this.model.dateFilter.dateRange = [new Date(start), new Date(end)];
          }
          this.performFullTextSearch();
        } catch (e) {
          console.log(e);
        }
      }
    } catch (e) {
      console.log(e);
      // Do nothing
    }
  },
  destroyed() {
    window.removeEventListener("resize", this.setLayout);
  },
  mounted() {
    const app = document.getElementById("fullTextSearch");
    app.removeAttribute("style");
  },
  computed: {
    datePickerLocale() {
      const config = {
        es_ES: {
          formatLocale: {
            months: [
              "Enero",
              "Febrero",
              "Marzo",
              "Abril",
              "Mayo",
              "Junio",
              "Julio",
              "Agosto",
              "Septiembre",
              "Octubre",
              "Noviembre",
              "Diciembre",
            ],
            monthsShort: [
              "En",
              "Feb",
              "Mar",
              "Abr",
              "May",
              "Jun",
              "Jul",
              "Ago",
              "Sept",
              "Oct",
              "Nov",
              "Dic",
            ],
            weekdaysMin: ["Dom", "Lun", "Mar", "Mier", "Jue", "Vie", "Sab"],
          },
        },
      };
      return config[this.currentLocale];
    },
  },
  methods: {
    getInnerWidth() {
      return window.innerWidth;
    },
    setLayout() {
      // this.verticalLayout = window.innerWidth < 768 ? true : false;
      if (this.isSearchPage) {
        // this.verticalLayout = window.innerWidth < 768 ? false : true;
        this.verticalLayout = true;
      } else {
        this.verticalLayout = window.innerWidth < 768 ? true : false;
      }
    },
    async performFullTextSearch() {
      if (this.isSearchPage) {
        try {
          const payload = JSON.parse(JSON.stringify(this.model));
          this.loader = true;
          this.searchResults = [];

          if (payload.isAdvanced) {
            payload.searchString = "";
            for (i = 0; i < payload.advanced.length; i++) {
              payload.advanced[i].searchType = this.fullTextFields.includes(
                payload.advanced[i].fieldType
              )
                ? "fullText"
                : "filter";
            }
          } else {
            payload.advanced = [];
          }

          const r = await CEPClient.get("/fullTextSearch", {
            params: {
              payload: JSON.stringify(payload),
            },
          });
          console.log(r.data);
          this.searchResults = r.data.hits;
          this.currentPage = r.data.page;
          this.totalResults = r.data.nbHits;
          this.totalPages = r.data.nbPages;
        } catch (e) {
          console.log(e);
        } finally {
          this.loader = false;
        }
      } else {
        window.location = `/index.php/${journalPath}/search?query=${btoa(
          JSON.stringify(this.model)
        )}`;
      }
    },
    prepareSearch(advanced) {
      this.model.nextPage = 1;
      this.model.hitsPerPage = 5;
      this.model.page = 0;
      this.model.currentPage = 0;
      this.model.isAdvanced = advanced;
      this.submitSearch(advanced);
    },
    submitSearch(advanced) {
      this.model.isAdvanced = advanced ? advanced : false;
      window.location = `/index.php/${journalPath}/search?query=${btoa(
        JSON.stringify(this.model)
      )}`;
    },
    nextPage() {
      this.model.nextPage =
        this.currentPage + 1 == this.totalPages
          ? this.currentPage
          : this.currentPage + 1;
      this.model.page = this.model.nextPage;
      this.submitSearch(this.model.isAdvanced);
    },
    prevPage() {
      this.model.nextPage =
        this.currentPage - 1 >= 0 ? this.currentPage - 1 : 0;
      this.model.page = this.model.nextPage;
      this.submitSearch(this.model.isAdvanced);
    },
    addFilter() {
      this.model.advanced.push({
        fieldType: "title",
        fieldValue: "",
        fieldOperator: "and",
        searchType: "fullText",
      });
    },
    rmFilter(index) {
      this.model.advanced.splice(index, 1);
    },
    articleURL(id) {
      return `${viewArticleURL}/${id}`;
    },
    galleyURL(article) {
      return `${viewArticleURL}/${article.id}/${article.pdf_galley}`;
    },
    disableMinDate(date) {
      const since = Date.parse("01 Jan 1980 00:00:00 GMT");

      return date < since;
    },
  },
});
