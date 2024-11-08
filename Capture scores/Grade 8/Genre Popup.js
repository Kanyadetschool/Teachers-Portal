
document.getElementById('search').addEventListener('click', function() {
    Swal.fire({
     
      html: `
     
       <img src="../images/icon-512x512.png" alt="" class="logoInswal">
           <img src="../images/right-arrow-svgrepo-com.svg" class="logoInswal">
       <img src="../images/knec.png" alt="" class="logoInswal">
      <h2>Select Class to proceed </h2> 
      
      <hr>
  
        <div class="GenreClasses">
  
          <a href="../Grade 1/Grade 1 Captures.html" target="_blank">Grade 1</a></li>
          <a href="../Grade 2/Grade 2 Captures.html" target="_blank">Grade 2</a></li>
          <a href="../Grade 3/Grade 3 Captures.html" target="_blank">Grade 3</a></li>
          <a href="../Grade 4/Grade 4 Captures.html" target="_blank">Grade 4</a></li>
          <a href="../Grade 5/Grade 5 Captures.html" target="_blank">Grade 5</a></li>
          <a href="../Grade 6/Grade 6 Captures.html" target="_blank">Grade 6</a></li>
          <a href="../Grade 7/Grade 7 Captures.html" target="_blank">Grade 7</a></li>
          <a href="../Grade 9/Grade 9 Captures.html" target="_blank">Grade 9</a></li>
         
        </div>
      `,
      showCloseButton: true,
      showConfirmButton: false,
      padding: '1em',
      customClass: {
        container: 'swal-container',
        title: 'swal-title',
        htmlContainer: 'swal-html-container'
      }
    });
  });
  
  
  
  
  
  
  