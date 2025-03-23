<script setup lang="ts"></script>

<template>
  <el-header>
    <AppHeader />
  </el-header>
  <el-main>
    <div class="privacy-card">
      <h2>Privacy</h2>
      <h3>Cookie Policy</h3>
      <h4>What Are Cookies?</h4>
      <p>
        Cookies are small text files or data packets that websites often store on users' devices,
        such as computers, phones, or tablets. These files help websites recognize returning users,
        streamline common tasks, and gather insights into browsing activity. Most browsers are
        configured to accept cookies by default.
      </p>
      <h4>How We Use Cookies</h4>
      <p>
        When you access the TRIMCIVtargeter web server, a cookie is sent to your device to
        distinguish you from other visitors. This is achieved through an indirect pseudonymous
        identifier. Cookies enhance your experience by making navigation smoother and enabling us to
        refine our website's functionality.
      </p>
      <h4>Types of Cookies We Use</h4>
      <p>TRIMCIVtargeter utilizes specific cookies for the following purposes:</p>
      <ul>
        <li>
          <strong>Analytics:</strong> To analyze user behavior, identify popular content, and
          resolve potential issues, thereby improving the website's overall performance.
        </li>
      </ul>
      <h4>Data Collected Through Cookies</h4>
      <p>
        TRIMCIVtargeter collects the following information when you interact with our web server:
      </p>
      <ul>
        <li>Details about your website visits, including pages viewed and links clicked.</li>
        <li>Device-specific information, such as browser type and operating system.</li>
        <li>Geographical location data.</li>
        <li>Your email address (if provided via the form).</li>
        <li>Data you submit, such as information entered in the submit result form.</li>
      </ul>
      <p>The collected data is anonymized and cannot be used to personally identify you.</p>
      <h4>Managing Cookies</h4>
      <p>
        While most browsers accept cookies automatically, you have the option to manage or disable
        them. Adjusting your browser settings allows you to block cookies or enable anonymous
        browsing. Refer to your browser's help documentation for guidance. Please note, however,
        that disabling cookies may affect your experience on the TRIMCIVtargeter web server.
      </p>
      <p>
        To block or reject cookies, consult your browser's instructions. For further details about
        cookies and how to manage them, visit
        <a href="http://www.allaboutcookies.org" target="_blank">http://www.allaboutcookies.org</a>.
      </p>
      <h4>Cookie and Data Retention</h4>
      <p>
        Cookies remain stored in your browser's cookie file even after you close the browser. They
        are reactivated upon revisiting the website unless deleted manually. These cookies do not
        collect data when you are not using the website.
      </p>
      <p>
        Any data collected and stored on the TRIMCIVtargeter web server will be deleted seven days
        after the results are made available.
      </p>

      <h4>Your Consent</h4>
      <p>
        By using the TRIMCIVtargeter web server, you agree to the terms outlined in this cookie
        policy. Any updates to this policy will be reflected on this page.
      </p>
      <p><strong>Policy Date:</strong> November 10, 2024.</p>
    </div>
  </el-main>
  <el-footer>
    <AppFooter />
  </el-footer>
</template>

<style scoped>
.privacy-card {
  --el-box-shadow-dark: 0 0px 20px rgba(143, 118, 255, 0.459);
  padding: 20px;
  border-radius: 4px;
  margin-bottom: 20px;
  margin-top: 20px;
  box-shadow: var(--el-box-shadow-dark);
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
}
</style>
