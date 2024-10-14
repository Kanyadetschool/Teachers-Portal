document.addEventListener('DOMContentLoaded', function () {
    const links = document.querySelectorAll('.link2, .link3, .link4');
    
    const PracticalsArray = [
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
      { title: 'The Year 2024', downloadLink: './Docs/Grade 2 End Term II The 2024.pdf' },
      { title: 'The 2023', downloadLink: './Docs/The_2023.pdf' },
      { title: 'The 2022', downloadLink: './Docs/The_2022.pdf' },
    ];
    
    const scoresArray = [
      { title: 'Scores 2021', downloadLink: './Docs/Scores_2021.pdf' },
      { title: 'Scores 2022', downloadLink: './Docs/Scores_2022.pdf' },
      { title: 'Scores 2023', downloadLink: './Docs/Scores_2023.pdf' },
    ];
    
    const knecSBAArray = [
      { title: 'KNEC S.B.A 2021', downloadLink: './Docs/KNEC_SBA_2021.pdf' },
      { title: 'KNEC S.B.A 2022', downloadLink: './Docs/KNEC_SBA_2022.pdf' },
      { title: 'KNEC S.B.A 2023', downloadLink: './Docs/KNEC_SBA_2023.pdf' },
    ];
    
    const knecUploadsArray = [
      { title: 'KNEC Uploads 2021', downloadLink: './Docs/KNEC_Uploads_2021.pdf' },
      { title: 'KNEC Uploads 2022', downloadLink: './Docs/KNEC_Uploads_2022.pdf' },
      { title: 'KNEC Uploads 2023', downloadLink: './Docs/KNEC_Uploads_2023.pdf' },
    ];
    
    const circularsArray = [
      { title: 'Circulars 2021', downloadLink: './Docs/Circulars_2021.pdf' },
      { title: 'Circulars 2022', downloadLink: './Docs/Circulars_2022.pdf' },
      { title: 'Circulars 2023', downloadLink: './Docs/Circulars_2023.pdf' },
    ];
    
    links.forEach(link => {
      link.addEventListener('click', function (event) {
        event.preventDefault(); // Prevent default link behavior
    
        const hrefTitle = this.textContent.trim(); // Get the text content of the clicked link
        let dataArray = [];
    
        switch (hrefTitle) {
          case 'Practicals':
            dataArray = PracticalsArray;
            break;
          case 'Scores':
            dataArray = scoresArray;
            break;
          case 'KNEC S.B.A':
            dataArray = knecSBAArray;
            break;
          case 'KNEC Uploads':
            dataArray = knecUploadsArray;
            break;
          case 'Circulars':
            dataArray = circularsArray;
            break;
          default:
            break;
        }
    
        const downloadLinks = dataArray.map(item => `<a href="${item.downloadLink}" target="_blank"> <i class="fas fa-home"></i> ${item.title}</a>`).join('');
    
        Swal.fire({
          title: ` ${hrefTitle} `,
          html: `<div class="download-links">${downloadLinks}</div> `, // Display the welcome message with downloadable links
          icon: 'info',
          confirmButtonText: 'OK'
        });
      });
    });
  });