import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Privacy Policy", description: "How AI254 collects and uses personal information.", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="November 2026">
      <section>
        <h2>Who we are</h2>
        <p>AI254 is a Kenyan educational technology initiative. You can contact us about privacy at <a href="mailto:info@ai254.net">info@ai254.net</a>. We aim to handle personal data in line with the Kenya Data Protection Act, 2019.</p>
      </section>
      <section>
        <h2>Information we collect on this website</h2>
        <ul>
          <li><strong>Demo requests:</strong> the details you enter in the form (name, email, phone, organisation, role, country, preferences and message) and your consent to be contacted.</li>
          <li><strong>Contact messages:</strong> your name, email, subject and message.</li>
          <li><strong>Technical data:</strong> a one-way salted hash of your IP address and your browser type, used only to prevent spam and abuse. We do not store your IP address in readable form.</li>
        </ul>
      </section>
      <section>
        <h2>Information processed by AI254 LIVE</h2>
        <ul>
          <li><strong>Students</strong> join with an admission number. We record when they join and leave a session, and any questions they choose to submit. Personal notes are kept in the student&apos;s own browser and are not sent to AI254.</li>
          <li><strong>Lecturers and administrators</strong> have accounts with a name, email address and a securely hashed password.</li>
          <li><strong>Lecture audio</strong> is captured only while the lecturer has switched capture on. It is sent for transcription and translation, and the resulting text is stored with the session. The AI254 LIVE web application does not keep audio recordings.</li>
          <li>Voice questions from students are converted to text by the speech features of the student&apos;s own browser. Only the resulting text is sent to AI254.</li>
        </ul>
      </section>
      <section>
        <h2>How we use information</h2>
        <p>We use it to respond to your request or message, to run lecture sessions, to keep the service secure, and to evaluate and improve the technology. We do not sell personal information or use it for advertising.</p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>Information is accessible to authorised AI254 staff. We use service providers to host the website and to send email. Information is not otherwise shared unless the law requires it.</p>
      </section>
      <section>
        <h2>Retention and your rights</h2>
        <p>We keep information only as long as we need it for the purposes above. You may ask us to access, correct or delete your personal information by writing to <a href="mailto:info@ai254.net">info@ai254.net</a>.</p>
      </section>
      <section>
        <h2>Cookies</h2>
        <p>The public website does not use advertising or analytics cookies. AI254 LIVE uses a strictly necessary cookie to keep lecturers and administrators signed in.</p>
      </section>
    </LegalPage>
  );
}
