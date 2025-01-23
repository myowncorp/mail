document.addEventListener("DOMContentLoaded", function () {
  // Use buttons to toggle between views
  document
    .querySelector("#inbox")
    .addEventListener("click", () => load_mailbox("inbox"));
  document
    .querySelector("#sent")
    .addEventListener("click", () => load_mailbox("sent"));
  document
    .querySelector("#archived")
    .addEventListener("click", () => load_mailbox("archive"));
  document.querySelector("#compose").addEventListener("click", compose_email);
  // By default, load the inbox
  load_mailbox("inbox");
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#compose-view").style.display = "block";

  // Clear out composition fields
  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";

  document
    .querySelector("#compose-form")
    .addEventListener("submit", function () {
      fetch("/emails", {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          recipients: document.querySelector("#compose-recipients").value,
          subject: document.querySelector("#compose-subject").value,
          body: document.querySelector("#compose-body").value,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          // Print results
          console.log(result);
        });
    });
}

function get_mail(mailbox) {
  console.log(`running inside get_mail for ${mailbox}`);

  return fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      return emails;
    });
}

function get_email(emailID){
/* This function will take an email passed through from the mailbox, fetched from the get_mail command
    then it will use the ID to fetch to a predetermined API address of that ID to return only that emails info */
  console.log(`running inside get_email for ${emailID}`);
  return fetch(`emails/${emailID}`)
    .then((response) => response.json())
    .then((email) => {
      console.log(email)
      return email;
    });
}


function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";

  document.querySelector("#compose-view").style.display = "none";

  // Show the mailbox name
  document.querySelector("#emails-view").innerHTML = `<h3>${
    mailbox.charAt(0).toUpperCase() + mailbox.slice(1)
  }</h3>`;

  get_mail(mailbox).then((emails) => {
    //create a loop to begin looping over the array of emails
    for (let i = 0; i < emails.length; i++) {
      // create a div element and store it
      divNode = document.createElement("div");
      // add a class to the elements
      divNode.classList.add("email-item");
      // place the email object into the divNode
      divNode.innerHTML = `From: ${emails[i].sender} on ${emails[i].timestamp} Subject: ${emails[i].subject} `;
      document.querySelector("#emails-view").appendChild(divNode);


      /* create the div for the body data outside of the click before the email.body is grabbed so it doesnt recreate it each click */
      // create a div for the body
      emailBodyNode = document.createElement("div");

      // add a class to it
      emailBodyNode.classList.add("email-body");

      // add an event listener to it
      divNode.addEventListener("click", function () {


        if (!emailBodyNode.body) {
          // increase the height of the div to 150px
          this.style.height = "150px";

          //append it to divNode
          this.appendChild(emailBodyNode);

          // get the email information
          get_email(emails[i].id).then((email) => {
            emailBodyNode.innerHTML = `Body: ${email.body}`;
          });


        }
      });
    }
  })
}
