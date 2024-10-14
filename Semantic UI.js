$(document).ready(function() {
      $('.ui.dropdown').dropdown();
    });

    
    $(document).ready(function() {
      var content = [
        { 
          title: 'Jasmin Hepzil', 
          class: 'Grade 1', 
          AssementNo: '900909080', 
          UPI: 'UXR676G', 
          Father: 'AB04040498', 
          Mother: 'AB04040498', 
          image: './img/log.svg', 
          details: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vitae justo est. Nullam non mauris eu turpis congue tincidunt. Aliquam erat volutpat.',
          doc1: 'path_to_jasmin_doc1.pdf',
          doc2: 'path_to_jasmin_doc2.pdf',
          doc3: 'path_to_jasmin_doc3.pdf',
          doc4: 'path_to_jasmin_doc4.pdf'
        },
        { 
          title: 'Jane Smith', 
          class: 'Class 2', 
          AssementNo: 'AB04040498', 
          Father: 'AB04040498', 
          Mother: 'AB04040498', 
          UPI: 'UOI002', 
          koko: 'UOI002', 
          image: './img/log.svg', 
          details: 'Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas.',
          doc1: 'path_to_jane_doc1.pdf',
          doc2: 'path_to_jane_doc2.pdf',
          doc3: 'path_to_jane_doc3.pdf',
          doc4: 'path_to_jane_doc4.pdf'
        },
        { 
          title: 'Afghanistan', 
          class: 'Class 3', 
          AssementNo: 'Ahmed Khan', 
          UPI: 'UOI003', 
          image: 'path_to_ahmed_image.jpg', 
          details: 'Fusce vulputate ipsum eget ex condimentum, eget fermentum dui dictum. Integer a erat ac magna lacinia faucibus. Proin lobortis pharetra convallis.',
          doc1: 'path_to_ahmed_doc1.pdf',
          doc2: 'path_to_ahmed_doc2.pdf',
          doc3: 'path_to_ahmed_doc3.pdf',
          doc4: 'path_to_ahmed_doc4.pdf'
        }
        // Add more entries here
      ];

      $('.ui.search').search({
        source: content,
        searchFields: ['title', 'AssementNo', 'UPI','Mother'], // Fields to search in
        searchFullText: true,
        onSelect: function(result, response) {
          $('#modalTitle').text(result.title);
          $('#modalClass').text(result.class);
          $('#modalAssementNo').text(result.AssementNo);
          $('#modalUPI').text(result.UPI);
          $('#modalMother').text(result.Mother);
          $('#modalImage').attr('src', result.image); // Update modal image
          $('#studentDetails').html(`<p>${result.details}</p>`); // Update student details

          // Update download button links
          $('#downloadBtn1').off('click').on('click', function() {
            window.open(result.doc1, '_blank');
          });
          $('#downloadBtn2').off('click').on('click', function() {
            window.open(result.doc2, '_blank');
          });
          $('#downloadBtn3').off('click').on('click', function() {
            window.open(result.doc3, '_blank');
          });
          $('#downloadBtn4').off('click').on('click', function() {
            window.open(result.doc4, '_blank');
          });

          $('#detailsModal').modal('show'); // Show the modal
        },
        templates: {
          suggestion: function(result) {
            return `
              <div class="result">
                <div class="content">
                  <img src="${result.image}" alt="Student Image">
                  <div class="title">${result.title}</div>
                  <div class="description">
                    <p>Class: ${result.class}</p>
                    <p>Full Name: ${result.AssementNo}</p>
                    <p>U.P.I No: ${result.UPI}</p>
                  </div>
                </div>
              </div>
            `;
          }
        }
      });

      // Handle download buttons
      $('#downloadBtn1').on('click', function() {
        // Implement download logic for Doc 1
        alert('Downloading Doc 1');
      });

      $('#downloadBtn2').on('click', function() {
        // Implement download logic for Doc 2
        alert('Downloading Doc 2');
      });

      $('#downloadBtn3').on('click', function() {
        // Implement download logic for Doc 3
        alert('Downloading Doc 3');
      });

      $('#downloadBtn4').on('click', function() {
        // Implement download logic for Doc 4
        alert('Downloading Doc 4');
      });
    });
  