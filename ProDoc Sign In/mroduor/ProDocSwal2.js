document.addEventListener('DOMContentLoaded', function() {
    // Initial call to display learners when the page loads
    displayLearners();
  });
  
  const learners = {
    Grade7: {
      Agriculture: [
        { 
          Name: "Schemes of work",
          embeddedLink: "https://docs.google.com/document/d/1FxJKrqDAL3kRpUzWpFQ7D65_x4BEfxyI/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Lesson Plan",
          embeddedLink: "https://docs.google.com/document/d/1Fyt7R1DXtuBQwJxp9KfT74Y1TKYoY337/edit?usp=sharing&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Lesson Notes",
          embeddedLink: "https://docs.google.com/document/d/1Fz9AXyAZywFarNzzVxagVBCv-JyTMqBP/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Record of Work Covered",
          embeddedLink: ""
        },
        { 
          Name: "Assessment Tools",
          embeddedLink: ""
        }
      ],
    },
    Grade6: {
      Mathematics: [
      
        { 
          Name: "Mathematics schemes of work",
          embeddedLink: "https://docs.google.com/document/d/1YV_yBdsmfRQsT1Y4ttrmUfxn4S3nJNwZV70fzzuxsqs/edit?usp=sharing"
        },
        { 
          Name: "Mathematics Lesson Plan",
          embeddedLink: "https://docs.google.com/document/d/1kJKluz_KE2cLVqw5qMH7t5rlo54L-dim/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Mathematics Lesson Notes",
          embeddedLink: "https://docs.google.com/document/d/1ib-6vPPsrBw3C3G-inJgCIb4QIGvbYL9/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Mathematics Record of Work Covered",
          embeddedLink: "https://docs.google.com/document/d/1ilGTZrso5sU5Xcjmbi111JP517KBFA7y/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
      ],
    },
    Grade5: {
      Agriculture: [
        { 
          Name: "Select",
          embeddedLink: ""
        },
        { 
          Name: "Agriculture schemes of work",
          embeddedLink: "https://docs.google.com/document/d/1eYK4v72il29CjRWj0fAbZMhpAkvI8vJK/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Agriculture Lesson Plan",
          embeddedLink: "https://docs.google.com/document/d/1jzdXFDkPTj6pmJNCq3Y8ByWsNWLE2fDE/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        }
      ]
    },
    Grade4: {
      Mathematics: [
        { 
          Name: "Select",
          embeddedLink: ""
        },
        { 
          Name: "Mathematics schemes of work",
          embeddedLink: "https://docs.google.com/document/d/1hCKq-I5kRld_0Qdgp1HirPUK0chJwkMz_Iq-dS5yF3g/edit?usp=drive_link"
        },
        { 
          Name: "Mathematics Lesson Plan",
          embeddedLink: "https://docs.google.com/document/d/1jpRC79f8fGUbP1P4lbMmBTjX9Y_bKO09/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        },
        { 
          Name: "Record of work Covered",
          embeddedLink: "https://docs.google.com/document/d/1j1DaRgZMHDuYWMXgJiArb3FuCfYM_f-m/edit?usp=drive_link&ouid=110287645281482421505&rtpof=true&sd=true"
        }
      ]
    },
    Grade4Agric: {
      Agriculture: [
        { 
          Name: "Select",
          embeddedLink: ""
        },
        { 
          Name: "Agriculture schemes of work",
          embeddedLink: "./io"
        },
        { 
          Name: "Agriculture Lesson Plan",
          embeddedLink: "./io"
        }
      ]
    }
  };
  
  function displaySubjects() {
    const selectedClass = document.getElementById("classSelect").value;
    const subjectSelect = document.getElementById("subjectSelect");
  
    subjectSelect.innerHTML = '<option value="">Select Subject</option>';
  
    if (selectedClass && learners[selectedClass]) {
      const subjects = Object.keys(learners[selectedClass]);
      subjects.forEach(subject => {
        const option = document.createElement("option");
        option.value = subject;
        option.textContent = subject;
        subjectSelect.appendChild(option);
      });
      subjectSelect.disabled = false;
    } else {
      subjectSelect.disabled = true;
      document.getElementById("learnerSelect").disabled = true;
    }
  }
  
  function displayLearners() {
    const selectedClass = document.getElementById("classSelect").value;
    const selectedSubject = document.getElementById("subjectSelect").value;
    const learnerSelect = document.getElementById("learnerSelect");
  
    learnerSelect.innerHTML = '<option value="">Select Document</option>';
  
    if (selectedClass && selectedSubject && learners[selectedClass][selectedSubject]) {
      const learnersInSubject = learners[selectedClass][selectedSubject];
      learnersInSubject.forEach((learner, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = learner.Name;
        learnerSelect.appendChild(option);
      });
      learnerSelect.disabled = false;
  
      learnerSelect.addEventListener('change', displayBiodata);
    } else {
      learnerSelect.disabled = true;
    }
  }
  
  function displayBiodata() {
    const selectedClass = document.getElementById("classSelect").value;
    const selectedSubject = document.getElementById("subjectSelect").value;
    const selectedLearnerIndex = document.getElementById("learnerSelect").value;
  
    if (selectedLearnerIndex !== "") {
      const selectedLearner = learners[selectedClass][selectedSubject][selectedLearnerIndex];
  
      if (!selectedLearner.embeddedLink) {
        // Show a warning if there's no embedded link
        Swal.fire({
          title: "No Document Available",
          text: "This document is not available or has not been embedded.",
          icon: "warning",
          showConfirmButton: true,
          confirmButtonText: "OK"
        });
      } else {
        const isSmallScreen = window.innerWidth <= 768;
  
        let contentHTML = `
          <button id="swal-close-btn" onclick="Swal.close()" style="position: absolute; top: 10px; right: 20px; background: transparent; border: none; font-size: 40px; cursor: pointer;">&times;</button>
          <iframe src="${selectedLearner.embeddedLink}" style="width:100%; height:900px;" frameborder="0"></iframe>`;
  
        if (isSmallScreen) {
          contentHTML += `<p><a href="${selectedLearner.embeddedLink}" target="_blank" class="swal-open-link">Open with DOC</a></p>`;
        }
  
        Swal.fire({
          title: `${selectedLearner.Name}'s Document`,
          html: contentHTML,
          showCancelButton: false,
          showConfirmButton: false,
          allowOutsideClick: true,
          width: '98%', // Adjust width of the popup
          customClass: {
            popup: 'swal-custom-popup'
          }
        });
      }
    }
  }
  