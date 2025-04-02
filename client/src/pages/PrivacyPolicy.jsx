import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  FiShield,
  FiDatabase,
  FiEye,
  FiLock,
  FiGlobe,
  FiCreditCard,
  FiRefreshCw,
  FiUserX,
  FiAlertCircle,
  FiBook,
} from "react-icons/fi";

const PrivacyPolicy = () => {
  const [activeTab, setActiveTab] = useState("general");
  const lastUpdated = "March 30, 2025";

  const privacyData = {
    general: [
      {
        id: "data-collection",
        icon: <FiDatabase className="h-5 w-5 text-primaryColor" />,
        title: "Information We Collect",
        content: `
          • Account Information: Name, email address, phone number, and shipping address.
          • Profile Data: Optional biography, profile picture, and seller credentials.
          • Transaction Information: Purchase history, payment details, and selling activity.
          • Device Information: IP address, browser type, operating system, and device identifiers.
          • Usage Data: Browsing patterns, search queries, and interaction with listings.
          • Communication Records: Customer service interactions and messaging with other users.
        `,
      },
      {
        id: "data-usage",
        icon: <FiEye className="h-5 w-5 text-primaryColor" />,
        title: "How We Use Your Data",
        content: `
          • Providing and maintaining the Pustak Bazar marketplace functionality.
          • Processing transactions and facilitating the buying/selling of books.
          • Authenticating your identity and preventing fraud or unauthorized access.
          • Personalizing your experience with relevant book recommendations.
          • Improving our services through analysis of user behavior and preferences.
          • Communicating important updates, policy changes, and promotional offers.
          • Resolving disputes between buyers and sellers when necessary.
        `,
      },
      {
        id: "data-sharing",
        icon: <FiGlobe className="h-5 w-5 text-primaryColor" />,
        title: "Information Sharing",
        content: `
          • With Other Users: Limited information is shared between buyers and sellers to facilitate transactions.
          • Service Providers: We work with trusted third parties for payment processing, shipping, and customer support.
          • Legal Requirements: We may disclose information if required by law, regulation, or legal process.
          • Business Transfers: Information may be transferred as part of a merger, acquisition, or sale of assets.
          • Aggregated Data: Non-identifying, aggregated data may be shared for marketing or research purposes.
          
          We never sell your personal information to third parties for marketing purposes.
        `,
      },
    ],
    sellers: [
      {
        id: "seller-privacy",
        icon: <FiShield className="h-5 w-5 text-primaryColor" />,
        title: "Seller-Specific Privacy",
        content: `
          • Public Profile: As a seller, your name/username, average rating, and seller information will be publicly visible.
          • Book Information: Details about books you list including price, condition, and your description will be public.
          • Contact Details: Approved buyers will receive limited contact information to facilitate delivery.
          • Performance Metrics: We collect and analyze seller-specific metrics such as response time and fulfillment rate.
          • Tax Information: For legal compliance, we collect and securely store tax-related information from sellers.
        `,
      },
      {
        id: "seller-data-controls",
        icon: <FiLock className="h-5 w-5 text-primaryColor" />,
        title: "Seller Data Controls",
        content: `
          • Inventory Privacy: You can temporarily hide listings without deleting them.
          • Profile Visibility: Control which elements of your seller profile are publicly visible.
          • Earnings Privacy: Your sales volume and earnings are kept confidential from other users.
          • Contact Preferences: Set your preferred communication channels for buyer inquiries.
          • Review Management: While you cannot remove legitimate reviews, you can respond to them publicly.
        `,
      },
    ],
    security: [
      {
        id: "data-security",
        icon: <FiLock className="h-5 w-5 text-primaryColor" />,
        title: "Security Measures",
        content: `
          • Encryption: All sensitive data is encrypted in transit and at rest using industry-standard protocols.
          • Access Controls: Strict internal access controls limit who can access user information.
          • Secure Payments: Payment processing meets PCI DSS compliance standards.
          • Regular Audits: We conduct security audits and vulnerability testing on a regular schedule.
          • Incident Response: We have procedures in place to promptly address any data security incidents.
          • Employee Training: Our team receives regular training on data protection and security best practices.
        `,
      },
      {
        id: "payment-security",
        icon: <FiCreditCard className="h-5 w-5 text-primaryColor" />,
        title: "Payment Information",
        content: `
          • Limited Storage: We store only the minimum payment information necessary for transaction records.
          • Tokenization: Payment card details are tokenized rather than stored directly on our servers.
          • Third-Party Processors: We use established, secure payment processors for all transactions.
          • Fraud Prevention: Automated and manual systems monitor for suspicious payment activity.
          • Transparency: You'll always be informed before any payment is processed.
        `,
      },
    ],
    rights: [
      {
        id: "user-rights",
        icon: <FiUserX className="h-5 w-5 text-primaryColor" />,
        title: "Your Privacy Rights",
        content: `
          • Access: You can request a copy of the personal data we hold about you.
          • Correction: You may update or correct any inaccurate information in your account.
          • Deletion: You can request deletion of your personal data, subject to legal requirements.
          • Portability: You can request your data in a structured, commonly used format.
          • Restriction: You may request limitation on how we use your data in certain circumstances.
          • Objection: You can object to our processing of your data for legitimate interests.
          • Withdrawal: You may withdraw consent for optional data processing at any time.
          
          To exercise these rights, please contact our Privacy Team at privacy@pustakbazar.com.
        `,
      },
      {
        id: "policy-updates",
        icon: <FiRefreshCw className="h-5 w-5 text-primaryColor" />,
        title: "Policy Updates",
        content: `
          • Notification: We'll notify you of significant changes to this Privacy Policy via email or site announcement.
          • Regular Review: This policy is reviewed and updated periodically to reflect new practices or regulations.
          • Version History: Previous versions of our Privacy Policy are archived and available upon request.
          • Effective Date: Changes become effective 30 days after posting unless otherwise stated.
          • Feedback Period: Major changes include a feedback period before implementation.
        `,
      },
    ],
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8 gap-4">
        <div className="h-16 w-16 rounded-full bg-primaryColor/10 flex items-center justify-center">
          <FiShield className="h-9 w-9 text-primaryColor" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primaryColor">
            Privacy Policy
          </h1>
          <p className="text-muted-foreground mt-1">
            How Pustak Bazar collects, uses, and protects your information
          </p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-primaryColor/5 border border-primaryColor/20 rounded-lg">
        <p className="text-gray-700 flex items-start">
          <FiAlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-primaryColor mt-0.5" />
          <span>
            This Privacy Policy explains how we handle your personal information
            when you use Pustak Bazar. We value your privacy and are committed
            to protecting your data in accordance with applicable laws.
          </span>
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <Badge
          variant="outline"
          className="px-3 py-1 bg-primaryColor/5 text-primaryColor border-primaryColor/20"
        >
          Last Updated: {lastUpdated}
        </Badge>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-primaryColor/10 mb-12">
        <Tabs
          defaultValue="general"
          className="w-full"
          onValueChange={setActiveTab}
        >
          <div className="bg-primaryColor/5 p-4 border-b border-primaryColor/10">
            <TabsList className="grid grid-cols-4 w-full max-w-2xl mx-auto">
              <TabsTrigger
                value="general"
                className="data-[state=active]:bg-primaryColor data-[state=active]:text-white"
              >
                General
              </TabsTrigger>
              <TabsTrigger
                value="sellers"
                className="data-[state=active]:bg-primaryColor data-[state=active]:text-white"
              >
                For Sellers
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-primaryColor data-[state=active]:text-white"
              >
                Security
              </TabsTrigger>
              <TabsTrigger
                value="rights"
                className="data-[state=active]:bg-primaryColor data-[state=active]:text-white"
              >
                Your Rights
              </TabsTrigger>
            </TabsList>
          </div>

          {Object.keys(privacyData).map((tabKey) => (
            <TabsContent value={tabKey} key={tabKey} className="px-6 py-6">
              <ScrollArea className="">
                <div className="space-y-6">
                  {privacyData[tabKey].map((section) => (
                    <Card
                      key={section.id}
                      className="shadow-sm border-primaryColor/10 pt-0 gap-0"
                    >
                      <CardHeader className="bg-primaryColor/5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primaryColor/10 flex items-center justify-center">
                            {section.icon}
                          </div>
                          <CardTitle className="text-lg font-semibold text-primaryColor">
                            {section.title}
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="text-muted-foreground whitespace-pre-line">
                        {section.content}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="text-center text-muted-foreground text-sm mb-8">
        <p className="mt-2">
          For any questions regarding privacy, please contact{" "}
          <a
            href="mailto:aadik6                                       @gmail.com"
            className="text-primaryColor hover:underline"
          >
            aadik6                                       @gmail.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
