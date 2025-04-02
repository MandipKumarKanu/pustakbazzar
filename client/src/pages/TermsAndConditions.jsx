import React from "react";
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
import {
  FiBook,
  FiShield,
  FiDollarSign,
  FiTruck,
  FiUser,
  FiUserCheck,
  FiAlertTriangle,
  FiHelpCircle,
} from "react-icons/fi";

const TermsAndConditions = () => {
  const termsData = [
    {
      id: "seller-terms",
      icon: <FiUserCheck className="h-5 w-5 text-primaryColor" />,
      title: "Seller Eligibility & Approval",
      content: `
        • Sellers must register and undergo a verification process before listing books.
        • Pustak Bazar reserves the right to decline seller applications that don't meet our standards.
        • Approved sellers can list books without additional approval for each listing.
        • Seller accounts may be suspended or terminated for policy violations.
      `,
    },
    {
      id: "listing-terms",
      icon: <FiBook className="h-5 w-5 text-primaryColor" />,
      title: "Book Listing Guidelines",
      content: `
        • All books must be accurately described regarding condition, edition, and authenticity.
        • Counterfeit or illegally reproduced books are strictly prohibited.
        • Pricing must be reasonable and competitive within market standards.
        • Inappropriate content that violates community guidelines is not permitted.
        • Sellers are responsible for maintaining accurate inventory information.
      `,
    },
    {
      id: "payment-terms",
      icon: <FiDollarSign className="h-5 w-5 text-primaryColor" />,
      title: "Payment & Commission",
      content: `
        • Pustak Bazar charges a 10% commission on each successful sale.
        • Payment processing fees are separate and will be clearly displayed.
        • Sellers receive payments within 7 business days after order completion.
        • Refunds due to seller error will be deducted from seller accounts.
        • Tax obligations remain the responsibility of individual sellers.
      `,
    },
    {
      id: "shipping-terms",
      icon: <FiTruck className="h-5 w-5 text-primaryColor" />,
      title: "Shipping & Delivery",
      content: `
        • Sellers must ship orders within 48 hours of purchase confirmation.
        • Accurate shipping information must be provided by sellers.
        • Shipping rates should be reasonable and clearly displayed.
        • Sellers are responsible for safe packaging of books.
        • Delivery tracking must be updated promptly when available.
      `,
    },
    {
      id: "buyer-terms",
      icon: <FiUser className="h-5 w-5 text-primaryColor" />,
      title: "Buyer Policies",
      content: `
        • Buyers must provide accurate information for purchases and delivery.
        • Harassment of sellers is prohibited and may result in account suspension.
        • Buyers have 3 days after delivery to report issues with orders.
        • Malicious or fraudulent return attempts will result in penalties.
        • Buyers agree to respect the intellectual property rights of all content.
      `,
    },
    {
      id: "privacy-terms",
      icon: <FiShield className="h-5 w-5 text-primaryColor" />,
      title: "Privacy & Data Protection",
      content: `
        • Personal information is collected only as necessary for platform operations.
        • User data is never sold to third parties for marketing purposes.
        • Secure payment processing follows industry standards.
        • Users may request deletion of personal data subject to legal requirements.
        • Communication preferences can be managed in account settings.
      `,
    },
    {
      id: "dispute-terms",
      icon: <FiAlertTriangle className="h-5 w-5 text-primaryColor" />,
      title: "Dispute Resolution",
      content: `
        • Disputes between buyers and sellers should first attempt resolution through direct communication.
        • Pustak Bazar will mediate unresolved disputes within 14 days.
        • Evidence must be provided by both parties in dispute cases.
        • Pustak Bazar's decision is final in all platform-related disputes.
        • Legal action should be a last resort after platform mediation.
      `,
    },
    {
      id: "changes-terms",
      icon: <FiHelpCircle className="h-5 w-5 text-primaryColor" />,
      title: "Platform Changes & Updates",
      content: `
        • Pustak Bazar reserves the right to modify these terms with 30 days notice.
        • Major platform changes will be announced through multiple channels.
        • Continued use after changes constitutes acceptance of updated terms.
        • Feature deprecation will be communicated with reasonable transition periods.
        • User feedback is considered for platform improvements.
      `,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center mb-8 gap-4">
        <div className="h-16 w-16 rounded-full bg-primaryColor/10 flex items-center justify-center ">
          <FiBook className="h-9 w-9 text-primaryColor " />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-primaryColor">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground mt-1">
            Pustak Bazar's platform policies and guidelines
          </p>
        </div>
      </div>

      <div className="mb-8 p-4 bg-primaryColor/5 border border-primaryColor/20 rounded-lg">
        <p className="text-primaryColor-foreground flex items-start">
          <FiAlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 text-primaryColor mt-2" />
          <span>
            These terms govern your use of Pustak Bazar. By using our platform,
            you agree to these conditions. Please read them carefully,
            particularly if you intend to sell books through our marketplace.
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {termsData.slice(0, 4).map((section) => (
          <Card
            key={section.id}
            className="shadow-md border-primaryColor/10 overflow-hidden pt-0 gap-3"
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
            <CardContent className="text-sm text-muted-foreground whitespace-pre-line">
              {section.content}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-primaryColor/10 mb-10">
        <div className="bg-primaryColor/5 p-6 border-b border-primaryColor/10">
          <h2 className="text-xl font-semibold text-primaryColor">
            Additional Terms
          </h2>
          <p className="text-muted-foreground mt-1">
            Expand sections below to read more details
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {termsData.slice(4).map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="border-b border-primaryColor/10 hover:bg-primaryColor/20 "
            >
              <AccordionTrigger className="px-2 mx-4 py-4 cursor-pointer">
                <div className="flex items-center">
                  {section.icon}
                  <span className="ml-2 font-medium text-primaryColor-foreground">
                    {section.title}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground px-9 whitespace-pre-line">
                {section.content}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="text-center text-muted-foreground text-sm mb-8">
        <p>Last updated: March 30, 2025</p>
        <p className="mt-2">
          For any questions regarding these terms, please contact{" "}
          <a
            href="mailto:support@pustakbazar.com"
            className="text-primaryColor hover:underline"
          >
            support@pustakbazar.com
          </a>
        </p>
      </div>
    </div>
  );
};

export default TermsAndConditions;
