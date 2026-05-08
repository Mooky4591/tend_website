export const metadata = {
  title: 'Privacy Policy | Tendr',
  description: "Read Tendr's Privacy Policy and how we collect, use, and protect your information.",
}

const privacyPolicyText = `Privacy Policy
Tendr
Last updated May 8, 2026
This Privacy Policy applies to all SMS communications and services provided by Tendr,
including Tendr's SMS-based home warranty assistant, claim support messages, claim
status updates, home maintenance reminders, and related product recommendations.

Overview
This Privacy Policy for Tendr ("Tendr," "we," "us," or "our") explains how we collect, use, store,
protect, and share personal information when you use our services, including our website, SMS-
based home warranty and home maintenance assistant, and related support services.
Tendr provides an AI-powered SMS home assistant that helps homeowners manage home
maintenance, ask warranty coverage questions, receive claim support and claim status updates, and
receive relevant home maintenance reminders. All SMS communications are sent only to users who
have opted in to receive messages from Tendr.
Tendr only sends SMS messages to users who have provided explicit opt-in consent. SMS consent is
optional and is not required to purchase or use warranty services. Message frequency varies.
Message and data rates may apply. Reply HELP for help or STOP to cancel.
If you have questions or concerns about this Privacy Policy, contact us at support@trytendr.org.

SMS Privacy Statement
Tendr only sends SMS messages to users who have provided explicit opt-in consent. You may opt out
of SMS messages at any time by replying STOP to any message from Tendr. Reply HELP for help.
Message frequency varies. Message and data rates may apply.
Tendr does not sell, rent, or share your mobile phone number, SMS opt-in data, SMS consent
records, or text messaging originator opt-in data with third parties, affiliates, lead generators, or
marketing partners for marketing or promotional purposes.
To request deletion of your SMS consent records, SMS opt-in records, SMS conversation history,
mobile phone number, or related Tendr SMS data, contact support@trytendr.org. We may retain
limited records when necessary to honor opt-out requests, comply with legal obligations, prevent
fraud or abuse, maintain suppression records, resolve disputes, enforce agreements, or document
SMS consent.

Summary of Key Points
• We collect information needed to provide Tendr services, such as name, mobile phone number,
email address if provided, contact preferences, mailing or service address, home system and
appliance details, warranty-related information, SMS conversation history, and SMS opt-in
records.
• We use your information to provide the service, respond to questions, support warranty and
claim-related requests, send home maintenance reminders, improve Tendr, protect the service,
maintain consent records, and comply with legal obligations.
• SMS consent is optional. You can use or purchase warranty services without agreeing to receive
Tendr SMS messages.
• To opt out of SMS messages at any time, reply STOP to any message from Tendr. Reply HELP for
help. Message frequency varies. Message and data rates may apply.
• We do not sell, rent, or share mobile phone numbers, SMS opt-in data, SMS consent records, or
text messaging originator opt-in data with third parties or affiliates for marketing or
promotional purposes.
• We may use service providers, such as cloud hosting, communications, data storage, customer
support, security, and AI service providers, only as needed to provide and support Tendr
services.
• You may request deletion of your SMS consent records, SMS opt-in records, SMS conversation
history, mobile phone number, or related Tendr SMS data by contacting support@trytendr.org.
• We do not knowingly collect information from or market to children under 18.

Table of Contents
• 1. What Information Do We Collect?
• 2. SMS Messaging, Consent, and Mobile Data Privacy
• 3. How Do We Process Your Information?
• 4. When and With Whom Do We Share Personal Information?
• 5. Artificial Intelligence-Based Products
• 6. How Long Do We Keep Your Information?
• 7. How Do We Keep Your Information Safe?
• 8. Do We Collect Information From Minors?
• 9. What Are Your Privacy Rights?
• 10. Controls for Do-Not-Track Features
• 11. United States Resident Privacy Rights
• 12. Updates to This Policy
• 13. Contact Us
• 14. Review, Update, or Delete Your Information

For full policy text sections 1-14, contact support@trytendr.org.`

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <pre className="whitespace-pre-wrap text-sm leading-7 font-sans">{privacyPolicyText}</pre>
      </div>
    </main>
  )
}
