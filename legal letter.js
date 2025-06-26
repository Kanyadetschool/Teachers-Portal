Swal.fire({
  icon: 'warning',
  title: '🚨 URGENT NOTICE – PAYMENT REQUIRED',
  html: `
   <div style="text-align:left; font-family: 'Roboto', Helvetica, Arial, sans-serif; max-width: 960px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 20px;">
    <h3 style="margin: 10px 0; color: #182c59;">DevOps Web Designers</h3>
    <p style="font-size: 14px; color: #666;">P.O. Box 1234-00100, Nairobi, Kenya | support@devopswebdesigners.co.ke | +254769106047</p>
  </div>
  
  <h2 style="color: #d32f2f; text-align: center; font-size: 20px; margin-bottom: 20px;">FINAL DEMAND NOTICE FOR OVERDUE PAYMENT</h2>
  
  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>Date Issued:</b> June 21, 2025, 04:15 AM EAT<br>
    <b>To:</b> Mr. Aggrey Ajwang, Headteacher<br>
    <b>Subject:</b> Immediate Settlement of Overdue Payment (Ksh 12,000.00) – Breach of Contract
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>1. Violation of Contractual Obligations</b><br>
    DevOps Web Designers hereby issues this <b>final demand</b> to Mr. Aggrey Ajwang, Headteacher, for the immediate settlement of an overdue payment of <b>Ksh 12,000.00</b>, as stipulated in Clause 5.2 of the Service Agreement dated [Insert Contract Date]. The failure to remit this payment constitutes a material breach of the agreement, violating the terms and conditions binding the institution to DevOps Web Designers, as well as obligations under the Kenyan Consumer Protection Act, 2012.
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>2. Critical Nature of Services</b><br>
    The institution’s website and associated digital services are indispensable for academic operations, parent-teacher communication, and stakeholder engagement. Non-payment has resulted in restricted access, causing significant disruptions, including:
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Inability to access online learning resources, affecting student academic progress.</li>
      <li>Impaired communication channels for parents and the school community.</li>
      <li>Potential reputational damage due to perceived mismanagement.</li>
    </ul>
    Continued non-compliance risks complete suspension of services, further exacerbating these impacts.
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>3. Legal and Financial Consequences</b><br>
    Failure to settle the outstanding amount of <b>Ksh 12,000.00</b> by <b>5:00 PM EAT on Wednesday, June 25, 2025</b> (within 3 working days from the date of this notice) will result in:
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li>Initiation of <b>formal legal proceedings</b> under the Kenyan Contracts Act and Consumer Protection Act, 2012, to recover the outstanding balance.</li>
      <li>Additional charges, including statutory penalties, legal fees, and interest at the prevailing rate as permitted by law.</li>
      <li>Potential escalation to credit reporting agencies, impacting the institution’s financial standing.</li>
    </ul>
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>4. Urgent Call to Action</b><br>
    We urgently call upon the school administration, parents, and the school board to compel immediate action to rectify this breach. Parents are strongly encouraged to engage with the Headteacher to ensure prompt payment, safeguarding the institution’s operational integrity and student welfare. Payment must be made via:
    <ul style="margin: 10px 0; padding-left: 20px;">
      <li><b>PESALINK or M-PESA</b>: +254769106047 or +2540112934576</li>
      <li><b>PayPal</b>: <a href="https://www.paypal.com/ncp/payment/5APZ4QTAHH3NA" style="color: #ff1cac;">Pay Now</a></li>
      <li><b>QR Code</b>: Scan the QR code below for direct payment (generated via your payment provider).</li>
    </ul>
    <img src="./images/payment-qr-code.png" alt="Payment QR Code" style="width: 100px; height: 100px; margin: 10px auto; display: block;">
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>5. Contact Information</b><br>
    For payment confirmation or inquiries, please contact our support team immediately:<br>
    <b>Email</b>: support@devopswebdesigners.co.ke<br>
    <b>Phone</b>: +254769106047 or +2540112934576<br>
    <b>Office</b>: P.O. Box 1234-00100, Nairobi, Kenya
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    <b>6. Closing Statement</b><br>
    DevOps Web Designers remains committed to providing reliable digital solutions for educational institutions. We implore the school to act swiftly to resolve this matter, avoiding legal escalation and ensuring uninterrupted access to critical services.
  </p>

  <p style="text-align: left; font-size: 16px; line-height: 1.6;">
    Sincerely,<br>
    <b>DevOps Web Designers Legal and Compliance Team</b><br>
    P.O. Box 1234-00100, Nairobi, Kenya<br>
    Dated: June 21, 2025, 04:15 AM EAT
  </p>
</div>
  `,
  confirmButtonText: 'Acknowledge',
  confirmButtonColor: '#d33',
  width: 700,
  timer:200000,
  timerProgressBar: true,
  allowOutsideClick: false
});