function mentorshipRequestMailBody(studentName, alumniName, mentorshipId) {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mentorship Request</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }
        .email-container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            max-width: 100px;
            height: auto;
            margin-bottom: 10px;
        }
        .request-section {
            margin-bottom: 20px;
            text-align: center;
        }
        .action-button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #1a73e8;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 15px 5px;
            font-weight: bold;
        }
        .social-icons {
            text-align: center;
            margin-top: 20px;
        }
        .social-icons a {
            display: inline-block;
            margin: 0 10px;
        }
        .social-icons svg {
            width: 40px;
            height: 40px;
            fill: #555;
            transition: fill 0.3s ease;
        }
        .social-icons a:hover svg {
            fill: #1a73e8;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 14px;
        }
        .footer a {
            color: #1a73e8;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
        <h1>INGENIA</h1>
        <h2>Mentorship Request</h2>
        </div>
        
        <div class="request-section">
            <p>Dear ${alumniName},</p>
            <p>We hope this email finds you well. We're pleased to inform you that a student has requested your mentorship through our platform.</p>
            <h3>Student Name: <span style="color: #1a73e8;">${studentName}</span></h3>
            <p>As a valued alumnus of our institution, your guidance and expertise would be immensely beneficial for our current students. Please review this request and choose your response below.</p>
            <a href="${process.env.BASE_URL}/api/v1/alumni/update-mentorship-status/${mentorshipId}?status=accepted" class="action-button">Accept Request</a>
            <a href="${process.env.BASE_URL}/api/v1/alumni/update-mentorship-status/${mentorshipId}?status=rejected" class="action-button" style="background-color: #d93025;">Decline Request</a>
            <p>Thank you for your continued support and contribution to our community.</p>
        </div>
        
        <div class="social-icons">
            <a href="https://twitter.com/yourprofile" aria-label="Twitter">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>
            </a>
            <a href="https://www.instagram.com/technicalvidya_ltce/" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
            </a>
            <a href="https://github.com/Technical-Vidya/" aria-label="Github">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512"><path d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.9 21.9 38.9 58.6 27.7 72.9 21.3 2.3-16.2 8.6-27.7 15.7-34-56.5-6.5-116-28.3-116-126.3 0-27.7 10.2-50.5 26.2-68.4-2.6-6.5-11.4-34.2 2.9-71.1 21.6-6.8 71.1 27.7 71.1 27.7 20.3-5.6 42.3-8.6 64.3-8.6 21.6 0 44.3 3 64.6 8.6 0 0 48.6-34.5 71.1-27.7 14.6 36.9 5.2 64.6 2.9 71.1 16.2 17.9 26.2 40.7 26.2 68.4 0 98.3-59.8 119.8-116.7 126.3 8.9 7.6 16.8 23 16.8 47.4 0 34.3-.3 76.1-.3 86.1 0 6.5 4.6 14.3 17.3 12.1C426.2 457.4 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"/></svg>
            </a>
        </div>

        <div class="footer">
            <p>&copy; 2024 Technical Vidya at Lokmanya Tilak College of Engineering. All Rights Reserved.</p>
            <p>123 Engineering Road, Koparkhairane, Navi Mumbai</p>
        </div>
    </div>
</body>
</html>
 `;
}

module.exports = mentorshipRequestMailBody;