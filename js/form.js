var form = document.getElementById("ajax-contact");
    
    async function handleSubmit(event) {
      event.preventDefault();
      var status = document.getElementById("form-messages");
      var data = new FormData(event.target);
      fetch(event.target.action, {
        method: form.method,
        body: data,
        headers: {
            'Accept': 'application/json'
        }
      }).then(response => {
        if (response.ok) {
			$(status).removeClass('bg-danger');
			$(status).addClass('bg-success');

			// Set the message text.
			$(status).text('Your message successfully sent');
          form.reset()
        } else {
			$(status).removeClass('bg-success');
			$(status).addClass('bg-danger');
          response.json().then(data => {
            if (Object.hasOwn(data, 'errors')) {
				$(status).text(data["errors"].map(error => error["message"]).join(", "))
            } else {
				$(status).text("Oops! There was a problem submitting your form")
            }
          })
        }
      }).catch(error => {
        $(status).text("Oops! There was a problem submitting your form")
      });
    }
    form.addEventListener("submit", handleSubmit)