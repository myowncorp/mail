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
  document.querySelector("#email-view").style.display = "none";
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

function mark_read(emailID) {
  fetch(`emails/${emailID}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true, //update the read field
    }),
  });
}

function get_email(emailID) {
  /* This function will take an email passed through from the mailbox, fetched from the get_mail command
      then it will use the ID to fetch to a predetermined API address of that ID to return only that emails info */

  function transform_email_html(email) {
    document.querySelector(
      "#subject"
    ).innerHTML = `<b> Subject: </b> ${email.subject}`;
    document.querySelector(
      "#recipients"
    ).innerHTML = `<b> Recipients: </b> ${email.recipients}`;
    document.querySelector(
      "#from"
    ).innerHTML = `<b> From: </b> ${email.sender}`;
    document.querySelector("#body").innerHTML = `<b> Body: </b> ${email.body}`;
  }

  console.log(`running inside get_email for ${emailID}`);
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector("#email-view").style.display = "block";

  // clone the form, and replaceWith to remove the old listeners
  const oldForm = document.getElementById("archive-form");
  const newForm = oldForm.cloneNode(true); // Clone form without listeners
  oldForm.replaceWith(newForm); // Replace old form with new one

  fetch(`emails/${emailID}`)
    .then((response) => response.json())
    .then((email) => {
      // if read == false, it now equals true
      if (!email.read) {
        mark_read(email.id);
      }
      console.log(email);
      // create the div to hold the email
      emailNode = document.createElement("div");
      transform_email_html(email);

      // set the archived state to whatever it isnt
      const newArchivedStatus = !email.archived;
      // change the text just QOL
      if(newArchivedStatus===false){ 
        // if its false, the status was true therefore we are in an archived email
        document.getElementById("archive-button").innerHTML = `Unarchive this email`;
      }

      newForm.addEventListener("submit", (event) => {
        event.preventDefault();
        console.log(`here is email: ${email.id}`);
        console.log(`from archive function ${email.id}`);
        fetch(`emails/${email.id}`, {
          method: "PUT",
          body: JSON.stringify({
            archived: newArchivedStatus,
          }),
        }).then(() => {
          console.log(`Email ${email.id} archived status updated to ${newArchivedStatus}`);
          // attempt to load the inbox to clear out the fetched emails
          load_mailbox("inbox");
        
        });
      });
    });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#email-view").style.display = "none";
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
      if (emails[i].read === true) {
        divNode.style.backgroundColor = "gray";
      }
      // place the email object into the divNode
      divNode.innerHTML = `From: ${emails[i].sender} on ${emails[i].timestamp} Subject: ${emails[i].subject} `;
      document.querySelector("#emails-view").appendChild(divNode);
      // add an event listener to it
      divNode.addEventListener("click", () => get_email(emails[i].id));
    }
  });
}
