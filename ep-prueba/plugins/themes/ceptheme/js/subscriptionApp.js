var app = new Vue({
	delimiters: ["[[", "]]"],
	el: "#subscription-app",
	data: {
	  subscriptionTypes: subscriptionTypes,
	  selectedSubscription: null,
	  selectedFormat: null,
	  selectedPeriod: null,
	  selectedPrices: null,
	  currentPaymentMethod: "paypal",
	  currentStep: 0,
	  wizard: null,
	  futureIssue: currentIssueNumber,
	  currentUser: currentUser,
	},
	beforeMount() {
	  this.selectedSubscription =
		this.subscriptionTypes[0]["_data"]["name"][currentLocale];
	},
	mounted() {
	  let vm = this;
  
	  this.wizard = $(".slider-steps").slick({
		arrows: true,
		infinite: false,
		dots: false,
		draggable: false,
		prevArrow: $("#btn-volver"),
		// nextArrow: $('#btn-siguiente'),
		adaptiveHeight: true,
	  });
  
	  try {
		this.$refs["subscription0"][0].click();
	  } catch (e) {
		console.log(e);
	  }
  
	  // if (sessionStorage.getItem("selectedFormat")) {
	  //   selectedFormat = parseInt(sessionStorage.getItem("selectedFormat"));
	  //   this.setSelectedFormat(selectedFormat);
	  //   this.wizard.slick("slickGoTo", 2);
	  //   sessionStorage.removeItem("selectedFormat");
	  // }
  
	  this.setSelectedFormat(17);
	},
	watch: {
	  // whenever question changes, this function will run
	  selectedSubscription: function (newValue, oldValue) {
		this.getPricingDetails(17);
		this.getPricingDetails(1);
	  },
	},
	// filters: {
	//     localizedCurrency: function (value) {
	//         console.log(value.toLocaleString("es-CL"));
  
	//         return value.toLocaleString("es-CL");
	//     }
	// },
	methods: {
	  localizedCurrency(value) {
		let localeValue = +value;
  
		return localeValue.toLocaleString("es-CL");
	  },
	  subscriptionNames() {
		var subscriptions = [];
		this.subscriptionTypes.forEach((e) => {
		  subscriptions.indexOf(e["_data"]["name"][currentLocale]) === -1
			? subscriptions.push(e["_data"]["name"][currentLocale])
			: null;
		});
  
		return subscriptions;
	  },
	  getPricingDetails(id) {
		let vm = this;
		var pricingDetails = this.subscriptionTypes.filter((item) => {
		  if (vm.selectedSubscription == item["_data"]["name"][currentLocale]) {
			if (item["_data"]["format"] == id) {
			  return item;
			}
		  }
		});
		return pricingDetails;
	  },
	  getPricingDetailByType(id) {
		const period = 12;
		let vm = this;
  
		var pricingDetails = this.subscriptionTypes.filter((item) => {
		  if (
			item["_data"]["name"][currentLocale] == "Regular" ||
			item["_data"]["name"][currentLocale] == "Estudiante" ||
			item["_data"]["name"][currentLocale] == "Student"
		  ) {
			if (
			  item["_data"]["format"] == id &&
			  item["_data"]["duration"] == period
			) {
			  return item;
			}
		  }
		});
		return pricingDetails;
	  },
	  setSelectedFormat(id, element) {
		this.selectedPrices = this.getPricingDetails(id);
		this.selectedFormat = id;
		selectedFormat = id;
		sessionStorage.setItem("selectedFormat", id);
  
		try {
		  this.selectedPeriod = this.selectedPrices[0]._data.duration;
		} catch (e) {}
	  },
	  getSelectedFormat() {
		return this.selectedFormat;
	  },
	  getSelectedSubscription() {
		let vm = this;
		let subscription = this.subscriptionTypes.find((item) => {
		  let duration = item._data.duration;
		  let name = item._data.name[currentLocale];
		  let format = item._data.format;
  
		  if (
			duration == vm.selectedPeriod &&
			name == vm.selectedSubscription &&
			format == vm.selectedFormat
		  )
			return item;
		});
  
		return subscription;
	  },
	  validateStep() {
		let hasExecuted = false; // Variable de control global 
		if (this.currentStep == 0) {
		  if (this.selectedSubscription != null && this.selectedFormat != null) {
			this.currentStep++;
			this.wizard.slick("slickGoTo", this.currentStep);
		  }
		} else if (this.currentStep == 1) {
		  this.currentStep++;
		  this.wizard.slick("slickGoTo", this.currentStep);
		} else if (this.currentStep == 2) {
		  if (this.selectedPeriod != null) {
			this.currentStep++;
			this.wizard.slick("slickGoTo", this.currentStep);
		  }
		} else if (this.currentStep == 3) {
		  let url = subscriptionUrl;
  
		  let subscription = this.getSelectedSubscription();
		  if (this.currentPaymentMethod == "webpay") {
			url = url + "/webpayPayment?subscriptionTypeId=";
		  } else if (this.currentPaymentMethod == "paypal") {
			url = url + "/paypalPayment?subscriptionTypeId=";
		  } else {
			url = url + "/bankTransfer?subscriptionTypeId=";
		  }
  
		  url = url + subscription._data.id;
  
		  if (this.futureIssue != undefined) {
			url = url + "&futureIssue=" + this.futureIssue;
		  }
		  
		  window.location = url;
		}
		 
			
	  },
	  setSelectedSubscription(value, element) {
		this.selectedSubscription = value;
		this.selectedPrices = this.getPricingDetails(this.selectedFormat);
  
		$(".options-subscription .option").css("background-color", "#fff");
		$(element).css("background-color", "#FFD200");
	  },
	  setFutureIssue(issue) {
		this.futureIssue = issue;
	  },
	  stepBack() {
		this.currentStep--;
		if (this.currentStep < 0) this.currentStep = 0;
	  },
	  getName(item) {
		return item["_data"]["name"][currentLocale];
	  },
	  nextStep() {
		if(this.currentStep === 3){
		    let name = $('div.container-confirmation > ul > li:nth-child(1)').text().split(':');
		    name = name[1].replace(/ /g, "").replace('\n','');
		    let email = $('div.container-confirmation > ul > li:nth-child(4)').text().split(':');
		    email = email[1].replace(/ /g, "").replace('\n','');
		    let utm = localStorage.getItem("utm_source") ? localStorage.getItem("utm_source") : "sin rastreo";
		  // Llamada GET antes de enviar el formulario
		  $.get('/ep-prueba/ep-datos/desactivado.json', {
			  nombre: name,
			  email: email,
			  utm_source: utm
		  })
		  .done(function (data) {
			  console.log("Respuesta Zapier:", data);
		  })
		  .fail(function (error) {
			  console.error("Error en la petición GET:", error);
		  });
		}
		if (this.currentStep === 1 && this.currentUser === null) {
		  return false;
		}
		return true;
	  }, 
	},
  });
  