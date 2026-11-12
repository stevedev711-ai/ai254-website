import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";

export const metadata: Metadata = { title: "Terms of Use", description: "Terms for using the AI254 website and AI254 LIVE.", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Use" updated="November 2026">
      <section>
        <h2>About these terms</h2>
        <p>These terms apply to the AI254 website and the AI254 LIVE application. By using them you agree to these terms. If you have questions, contact <a href="mailto:info@ai254.net">info@ai254.net</a>.</p>
      </section>
      <section>
        <h2>Technology under development</h2>
        <p>AI254 LIVE is under active development and has been tested in early-stage classroom pilots only. Transcriptions and translations are produced automatically and may contain errors. They are a learning aid that sits alongside the lecturer&apos;s original English explanation; they do not replace it. Where accuracy matters, students should check against the lecture and the course materials.</p>
        <p>Where AI254 LIVE is shown in demonstration mode, the lecture content and translations are sample material prepared for illustration. They are not live system output.</p>
      </section>
      <section>
        <h2>Acceptable use</h2>
        <ul>
          <li>Use AI254 LIVE only for lectures and sessions you are authorised to join or run.</li>
          <li>Do not try to gain unauthorised access, disrupt the service or submit automated or abusive content.</li>
          <li>Lecturers are responsible for ensuring they may share the content of their lectures through the service.</li>
        </ul>
      </section>
      <section>
        <h2>Content and intellectual property</h2>
        <p>The AI254 name, logo, software and terminology resources belong to AI254. Lecture content remains the property of its authors and institutions.</p>
      </section>
      <section>
        <h2>Liability</h2>
        <p>The service is provided as is. To the extent permitted by law, AI254 is not liable for losses arising from reliance on automatic transcriptions or translations.</p>
      </section>
      <section>
        <h2>Changes</h2>
        <p>We may update these terms as the technology develops. The date at the top shows when they last changed.</p>
      </section>
    </LegalPage>
  );
}
