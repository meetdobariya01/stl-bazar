import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import { motion } from "framer-motion";
import {
  FaShieldAlt,
  FaUserLock,
  FaCookieBite,
  FaCreditCard,
  FaDatabase,
  FaEnvelope,
  FaLock,
  FaGlobe,
  FaChildren,
  FaBalanceScale,
  FaPhoneAlt,
  FaFileAlt,
  FaCheckCircle,
} from "react-icons/fa";
import "./privacypolicy.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

const sections = [
  {
    icon: 1,
    title: "Purpose, Scope and Applicability",
    content: (
      <>
        <p>
          This Privacy, Personal Data Protection and Data Governance Policy
          (Privacy Policy or Policy) sets out the manner in which Native91
          (Native91, Platform, we, us or our) collects, receives, uses,
          processes, stores, shares, protects, retains and, where applicable,
          deletes personal data relating to Users of the Native91 Platform. This
          Policy is intended to provide Users with transparency regarding the
          categories of information that may be collected in connection with
          their use of the Platform and the purposes for which such information
          may be processed.
        </p>
        <p>
          Native91 recognises that privacy and responsible handling of personal
          data are fundamental components of a trustworthy digital marketplace.
          Users may provide personal information while creating an Account,
          placing Orders, making payments, communicating with customer support,
          submitting reviews, seeking grievance redressal or otherwise
          interacting with the Platform. In addition, certain technical
          information may be collected automatically when a User accesses or
          uses the Platform, including information relating to the User's
          device, browser, network connection and interaction with the Platform.
        </p>
        <p>
          This Policy applies to personal data processed by Native91 in
          connection with the User's access to or use of the Platform, including
          information provided directly by the User and information generated or
          collected through the User's interaction with Native91's website,
          application, Account, customer-support channels and associated
          services.
        </p>
        <p>
          This Policy should be read together with Native91's Terms of Use,
          Cookie Policy, Buyer Policy and other applicable policies published on
          the Platform. In the event of any conflict between this Policy and a
          mandatory requirement of applicable data-protection or privacy law,
          the applicable law shall prevail to the extent of such conflict.
        </p>
      </>
    ),
  },

  {
    icon: 2,
    title: "Meaning of Personal Data and Data Principal",
    content: (
      <>
        <p>
          For the purposes of this Policy, Personal Data means information
          relating to an identified or identifiable individual, to the extent
          such information is recognised as personal data under applicable law.
          Depending upon the nature of the interaction between the User and
          Native91, such information may include identity information, contact
          details, account credentials, transaction-related information,
          technical information, communications and other information capable of
          being associated with a particular User.
        </p>
        <p>
          A User whose personal data is processed by Native91 may be referred to
          as the Data Principal to the extent such terminology is applicable
          under the Digital Personal Data Protection Act, 2023 (DPDP Act) and
          the rules, regulations, notifications or other subordinate legislation
          applicable thereunder.
        </p>
        <p>
          Native91 shall process personal data only for legitimate and disclosed
          purposes and shall seek to maintain reasonable safeguards against
          unauthorised access, misuse, alteration, disclosure, loss or
          destruction of such information.
        </p>
      </>
    ),
  },

  {
    icon: 3,
    title: " Categories of Personal Data Collected",
    content: (
      <>
        <p>
          Native91 may collect personal data directly from the User when the
          User voluntarily provides information to create or maintain an
          Account, place an Order, communicate with Native91, request
          assistance, submit feedback or otherwise use the Platform. Native91
          may also receive certain information automatically as a consequence of
          the User's interaction with the Platform.
        </p>
        <p>
          The categories of information collected may vary depending upon the
          particular service or feature used by the User. Native91 does not
          necessarily collect every category of information from every User, and
          the information collected shall generally depend up on the nature and
          purpose of the relevant interaction.
        </p>
        <p>
          Identity and contact information may include the User's name, email
          address, mobile telephone number and shipping or billing address. Such
          information may be necessary to establish and maintain an Account,
          communicate with the User, process an Order, arrange delivery, issue
          transaction-related communications and provide customer support.
        </p>
        <p>
          Account-related information may include username, Account identifiers,
          authentication information, OTP verification records and other
          information associated with the security and administration of the
          User's Account. Where passwords are used, Native91 shall take
          reasonable technical measures to avoid storing passwords in plain-text
          form and may use encryption, hashing or other appropriate security
          mechanisms for credential protection.
        </p>
        <p>
          Transaction-related information may include Order history, Products
          viewed or purchased, transaction references, payment status,
          applicable discounts, refunds, cancellations, exchanges and the
          payment method used for a transaction. Native91 may receive or process
          information necessary to facilitate payment; however, payment card and
          similar sensitive payment credentials are intended to be tokenised and
          processed through appropriate payment service providers rather than
          maintained by Native91 in plain, directly usable form.
        </p>
        <p>
          Technical and usage information may include IP address, device
          identifiers, browser type, operating-system information, approximate
          technical information associated with access to the Platform, session
          information and data generated through cookies or similar
          technologies. The collection and use of cookie-related information
          shall additionally be governed by Native91's applicable Cookie Policy.
        </p>
        <p>
          Communications information may include correspondence exchanged with
          customer support, grievance-related communications, chat interactions,
          feedback, complaints, reviews and other communications submitted by
          the User through the Platform or associated support channels.
        </p>
      </>
    ),
  },

  {
    icon: 4,
    title: "Information Provided During Account Registration",
    content: (
      <>
        <p>
          When a User creates an Account, Native91 may require certain
          information necessary to establish the Account and verify the User's
          contact details. Such information may include the User's name, email
          address, mobile number and authentication or verification information.
        </p>
        <p>
          Native91 may use OTP-based verification or other reasonable
          authentication mechanisms to confirm that the contact information
          supplied during registration is accessible to the User. Verification
          records may be maintained for security, fraud-prevention,
          dispute-resolution and compliance purposes.
        </p>
        <p>
          Users are responsible for ensuring that the information supplied
          during registration is accurate, complete and reasonably up to date.
          Where material information changes, the User should up date the
          relevant information through the available Account functionality or
          contact Native91's support team where self-service updating is
          unavailable.
        </p>
        <p>
          Native91 may rely upon the information supplied by the User for
          ordinary Platform operations. Accordingly, inaccuracies in contact or
          delivery information may result in communication failures,
          unsuccessful delivery, inability to complete transactions or delays in
          providing support.
        </p>
      </>
    ),
  },

  {
    icon: 5,
    title: "Information Collected in Connection With Orders",
    content: (
      <>
        <p>
          When a User places an Order, Native91 may process information
          necessary to accept, fulfil, administer and document that Order. Such
          information may include the User's name, delivery address, billing
          information, mobile number, email address, Product details,
          transaction reference, Order status and information relating to
          cancellation, exchange, return or refund.
        </p>
        <p>
          Certain Order information must be made available to the relevant
          Seller and logistics provider because fulfilment cannot ordinarily
          occur without disclosure of information such as the recipient's name,
          delivery address and contact details. Such sharing shall be limited to
          information reasonably necessary for the relevant fulfilment purpose.
        </p>
        <p>
          Order history may also be retained to allow Users to view previous
          transactions, access invoices or Order information, submit complaints,
          seek refunds or exchanges and obtain customer support.
        </p>
        <p>
          Native91 may further process transaction information for accounting,
          taxation, reconciliation, fraud prevention, dispute resolution,
          customer service and regulatory compliance purposes.
        </p>
      </>
    ),
  },

  {
    icon: 6,
    title: "Payment Information and Payment Processing",
    content: (
      <>
        <p>
          Native91 may facilitate payments through third-party payment service
          providers, banks, payment gateways and other authorised financial or
          payment intermediaries. When a User selects a payment method,
          information necessary to process the transaction may be transmitted to
          the relevant payment service provider.
        </p>
        <p>
          Native91 does not intend to store complete payment-card credentials in
          plain, directly usable form. Payment card information and other
          payment credentials may be tokenised or otherwise processed through
          the systems of the relevant payment partners.
        </p>
        <p>
          Depending upon the selected payment method, Native91 may receive
          transaction identifiers, payment status, masked payment information,
          confirmation details and other information necessary to reconcile the
          transaction. The actual payment processing may be subject to the
          privacy practices, security controls and terms of the relevant payment
          service provider.
        </p>
        <p>
          Native91 may also process transaction information relating to refunds,
          reversals, failed payments, chargebacks and payment disputes where
          necessary to administer the User's Order or comply with applicable
          financial, tax or regulatory requirements.
        </p>
      </>
    ),
  },

  {
    icon: 7,
    title: "Technical, Device and Usage Information",
    content: (
      <>
        <p>
          When a User accesses the Platform, Native91 may automatically collect
          certain technical information associated with the User's device and
          interaction with the Platform. Such information may include IP
          address, device identifiers, browser type, operating-system
          information, session-related information and other technical
          information reasonably necessary to maintain, secure and improve the
          Platform.
        </p>
        <p>
          Technical information may be used to maintain Platform functionality,
          diagnose technical problems, detect suspicious activity, prevent
          unauthorised access, improve security, analyse Platform performance
          and understand how Users interact with different features.
        </p>
        <p>
          Native91 may also use cookies and similar technologies to support
          essential Platform functionality, remember certain preferences,
          facilitate authentication, understand usage patterns and improve the
          User experience. The specific use of cookies and similar technologies
          shall be governed by the applicable Cookie Policy.
        </p>
        <p>
          Technical information may be combined with other information where
          reasonably necessary for security, fraud prevention, service
          improvement, legal compliance or other disclosed purposes.
        </p>
      </>
    ),
  },

  {
    icon: 8,
    title: "Communications, Reviews and Customer-support Information",
    content: (
      <>
        <p>
          Native91 may retain information contained in communications between
          the User and Native91's customer-support, grievance or other service
          channels. Such information may include emails, chat messages, support
          tickets, complaints, feedback, review content, photographs, videos and
          other material voluntarily submitted by the User.
        </p>
        <p>
          The processing of such information enables Native91 to investigate
          complaints, provide assistance, maintain records of interactions,
          resolve disputes, monitor service quality and improve the Platform.
        </p>
        <p>
          Where a User submits a review or other publicly visible content, the
          information may be displayed to other Users in accordance with the
          applicable Platform functionality and Terms of Use. Users should
          exercise reasonable caution before voluntarily publishing personal
          information in reviews, comments, photographs or other publicly
          accessible content.
        </p>
        <p>
          Native91 may retain relevant support communications for a reasonable
          period where necessary to establish the history of a complaint,
          investigate disputes, prevent abuse,comply with legal obligations or
          demonstrate the proper handling of a grievance.
        </p>
      </>
    ),
  },

  {
    icon: 9,
    title: "Purposes for Which Personal Data is Processed",
    content: (
      <>
        <p>
          Native91 processes personal data for legitimate and specified purposes
          connected with the operation and administration of the Platform.
          Depending upon the circumstances, such purposes may include creating
          and managing User Accounts, authenticating Users, processing Orders,
          facilitating payments, arranging delivery, providing customer support,
          processing cancellations and refunds, addressing grievances and
          maintaining transaction records.
        </p>
        <p>
          Personal data may also be processed to verify identity, detect and
          prevent fraud, identify suspicious transactions, protect the security
          and integrity of the Platform and prevent misuse of User Accounts or
          Platform features.
        </p>
        <p>
          Native91 may further use personal data to communicate with Users
          regarding Orders, payment confirmations, dispatch notifications,
          delivery updates, cancellation or refund status, security alerts,
          Account-related matters, changes to applicable policies and other
          communications necessary for the provision and administration of
          Platform services.
        </p>
        <p>
          Where a User has provided the required consent for promotional
          communications, Native91 may also use relevant contact information to
          send promotional offers, Product recommendations, marketing
          communications and information concerning Products or services that
          may be of interest to the User.
        </p>
        <p>
          Personal data may additionally be processed for tax, accounting,
          audit, record-keeping, regulatory and legal-compliance purposes where
          such processing is required or reasonably necessary under applicable
          law.
        </p>
      </>
    ),
  },

  {
    icon: 10,
    title: "Legal Basis for Processing Personal Data",
    content: (
      <>
        <p>
          Native91 may process personal data on the basis of consent obtained
          from the User at or before the relevant point of collection, where
          consent is the applicable legal basis for such processing.
        </p>
        <p>
          Personal data may also be processed where such processing is necessary
          for the performance of a contract or for taking steps at the request
          of the User before entering into a contractual relationship. For
          example, information concerning a delivery address and contact number
          may be necessary to fulfil an Order placed by the User.
        </p>
        <p>
          Native91 may further process personal data where such processing is
          necessary to comply with a legal or regulatory obligation applicable
          to Native91. This may include obligations relating to taxation,
          accounting, financial records, consumer protection, law ful requests
          from competent authorities and other regulatory requirements.
        </p>
        <p>
          Where consent is relied upon, Native91 shall seek to obtain consent
          through an appropriate mechanism and shall not treat consent as
          permanently irrevocable where applicable law provides a right to
          withdraw it.
        </p>
      </>
    ),
  },

  {
    icon: 11,
    title: "Use of Personal Data for Fraud Prevention and Platform Security",
    content: (
      <>
        <p>
          Native91 may process personal data and technical information for
          purposes of maintaining the security and integrity of the Platform.
          Such processing may be necessary to detect unusual Account activity,
          identify potentially fraudulent Orders, prevent misuse of payment
          mechanisms, investigate suspicious login attempts and protect Users,
          Sellers and Native91 against fraudulent or unauthorised conduct.
        </p>
        <p>
          Where an Account or transaction presents security indicators requiring
          further verification, Native91 may request additional authentication
          or temporarily restrict certain functionality while the matter is
          reviewed.
        </p>
        <p>
          Native91 may also use technical information such as IP addresses,
          device information and authentication records to investigate security
          incidents and identify patterns of misuse, subject to applicable law.
        </p>
        <p>
          Security-related processing shall be limited to purposes reasonably
          connected with protecting the Platform, Users, Sellers and associated
          systems.
        </p>
      </>
    ),
  },

  {
    icon: 12,
    title: " Personalisation and Product Recommendations",
    content: (
      <>
        <p>
          Native91 may process information concerning Products viewed, searched
          for, purchased or otherwise interacted with in order to improve the
          User experience and provide more relevant Product recommendations.
        </p>
        <p>
          Personalisation may involve analysing transaction history, browsing
          behaviour, preferences and interactions with Platform features. The
          purpose of such processing is to help Users discover Products that may
          be relevant to their interests and to improve the presentation and
          organisation of the Platform.
        </p>
        <p>
          Where applicable law requires consent for a particular form of
          personalised marketing or profiling, Native91 shall obtain or rely
          upon the appropriate legal basis before carrying out such processing.
        </p>
        <p>
          A User may continue to use core Platform functions even where the User
          chooses not to receive promotional communications, although certain
          personalised features may be affected depending upon the nature of the
          consent withdrawn.
        </p>
      </>
    ),
  },

  {
    icon: 13,
    title: "Sharing of Personal Data With Sellers",
    content: (
      <>
        <p>
          Because Native91 operates as a marketplace involving independent
          Sellers, certain personal data must be shared with the Seller
          responsible for fulfilling an Order.
        </p>
        <p>
          Information such as the User's name, shipping address and contact
          number may be provided to the relevant Seller to the extent necessary
          to prepare, pack and dispatch the Product and facilitate successful
          fulfilment.
        </p>
        <p>
          Such disclosure shall be limited to the purpose for which the
          information is required. Sellers are expected to handle User
          information responsibly and in accordance with applicable contractual,
          legal and data-protection requirements.
        </p>
        <p>
          Native91 does not authorise Sellers to use User information obtained
          solely for Order fulfilment for unrelated independent marketing
          purposes unless such use is separately lawful and appropriately
          disclosed or consented to where required.
        </p>
      </>
    ),
  },

  {
    icon: 14,
    title: "Sharing With Logistics and Delivery Partners",
    content: (
      <>
        <p>
          Personal data necessary to deliver an Order may be shared with
          logistics, courier and shipping partners engaged by Native91 or the
          relevant Seller.
        </p>
        <p>
          Such information may include the recipient's name, delivery address,
          mobile number, Order reference and other information reasonably
          necessary to arrange dispatch, delivery, tracking, communication
          concerning delivery and management of failed delivery attempts.
        </p>
        <p>
          Logistics partners may process the information solely for purposes
          connected with providing their services, subject to their contractual
          obligations and applicable law.
        </p>
        <p>
          Native91 may also share relevant information with logistics partners
          when investigating delivery disputes, damaged Products, failed
          delivery attempts, return pickups or other fulfilment-related issues.
        </p>
      </>
    ),
  },

  {
    icon: 15,
    title: "Payment Partners, Banks and Financial Service Providers",
    content: (
      <>
        <p>
          Native91 may disclose or transmit relevant transaction information to
          payment gateways, banks and other payment service providers for
          purposes of processing payments, validating transactions, reconciling
          payments, preventing fraud and processing refunds or reversals.
        </p>
        <p>
          Payment-related information may be transmitted to service providers
          authorised or otherwise legally permitted to provide the relevant
          payment service.
        </p>
        <p>
          Native91 does not sell User personal data to payment partners or
          financial institutions for their unrelated independent marketing
          purposes merely because such entities participate in processing an
          Order.
        </p>
        <p>
          The handling of payment information by a third-party payment provider
          may additionally be subject to that provider's own terms and privacy
          practices.
        </p>
      </>
    ),
  },

  {
    icon: 16,
    title: "Disclosure Required by Law or Government Authority",
    content: (
      <>
        <p>
          Native91 may disclose personal data where such disclosure is required
          or permitted by applicable law, legal process, court order,
          governmental direction, regulatory requirement or lawful request from
          a competent authority.
        </p>
        <p>
          Such disclosure may occur where necessary to comply with statutory
          obligations, respond to legal proceedings, investigate suspected
          unlawful activity, protect the rights and safety of Users or other
          persons, enforce contractual rights, or protect the security and
          integrity of Native91's systems.
        </p>
        <p>
          Where legally permissible, Native91 may seek to limit disclosures to
          information reasonably necessary for the relevant purpose.
        </p>
        <p>
          Native91 shall not interpret the confidentiality provisions of this
          Policy as preventing disclosure where a legal obligation requires
          Native91 to provide relevant information to a competent authority.
        </p>
      </>
    ),
  },

  {
    icon: 17,
    title: "Corporate Transactions and Business Transfers",
    content: (
      <>
        <p>
          In the event of a merger, acquisition, restructuring, financing
          transaction, sale of assets, transfer of business or similar corporate
          transaction involving Native91, personal data may be transferred to
          the relevant successor, acquiring entity or other transaction
          participant where such transfer is reasonably necessary for completion
          or administration of the transaction.
        </p>
        <p>
          Where personal data is transferred in connection with such a
          transaction, Native91 shall seek to ensure that the recipient is
          subject to appropriate confidentiality and privacy obligations and
          maintains an equivalent or otherwise legally adequate standard of
          protection for the information.
        </p>
        <p>
          Any successor entity receiving personal data may continue to process
          such information for the purposes for which it was originally
          collected, subject to applicable law and any updated privacy notice
          that may be required.
        </p>
      </>
    ),
  },

  {
    icon: 18,
    title: "No Sale of Personal Data for Independent Marketing",
    content: (
      <>
        <p>
          Native91 does not sell Users' personal data to third parties for their
          independent marketing use.
        </p>
        <p>
          This principle does not prevent Native91 from sharing information with
          service providers, Sellers, logistics partners, payment processors,
          banks, professional advisers or authorities where such sharing is
          necessary for the purposes described in this Policy, required to
          provide Platform services, necessary for legal compliance, or
          otherwise permitted by applicable law.
        </p>
        <p>
          Where third-party service providers process information on Native91's
          behalf, Native91 shall seek to impose appropriate contractual or
          operational safeguards consistent with the nature of the information
          and the services being provided.
        </p>
      </>
    ),
  },

  {
    icon: 19,
    title: "Data Retention",
    content: (
      <>
        <p>
          Native91 shall retain personal data only for as long as reasonably
          necessary to fulfil the purposes for which it was collected, to
          provide the relevant Platform services, to comply with legal or
          regulatory obligations, to resolve disputes, to enforce contractual
          rights, to maintain appropriate business records or for other
          legitimate purposes permitted under applicable law.
        </p>
        <p>
          Certain information may need to be retained for longer periods because
          of statutory or regulatory requirements. Transaction, tax, accounting,
          consumer-protection and otherlegally required records may therefore
          remain retained even after a User closes an Account.
        </p>
        <p>
          Native91 shall seek to avoid indefinite retention of personal data
          where such retention is no longer necessary or legally required. Once
          information is no longer required for a legitimate or legally mandated
          purpose, Native91 may securely delete, anonymise or otherwise
          de-identify the information in accordance with applicable retention
          and security procedures.
        </p>
      </>
    ),
  },

  {
    icon: 20,
    title: "Deletion and Anonymisation",
    content: (
      <>
        <p>
          Where personal data is no longer required for the purpose for which it
          was collected and no legal or legitimate retention requirement
          applies, Native91 may delete the information from its active systems.
        </p>
        <p>
          In certain circumstances, Native91 may anonymise or de-identify
          information instead of deleting it entirely. Information that has been
          properly anonymised so that it can no longer reasonably be associated
          with an identifiable individual may be retained for legitimate
          analytical, statistical, security or business purposes.
        </p>
        <p>
          Deletion from active systems may not necessarily result in immediate
          elimination of every technical copy, including information contained
          in secure backups or systems maintained for business continuity. Such
          information may be removed or overwritten in accordance with
          applicable backup cycles and retention procedures.
        </p>
      </>
    ),
  },

  {
    icon: 21,
    title: "Security Measures and Safeguards",
    content: (
      <>
        <p>
          Native91 recognises that personal data must be protected against
          unauthorised access, disclosure, alteration, loss, misuse and
          destruction. Native91 therefore seeks to implement reasonable security
          practices and procedures appropriate to the nature and sensitivity of
          the information processed.
        </p>
        <p>
          Security measures may include encryption of information in transit,
          access controls, authentication mechanisms, role-based access
          restrictions, secure storage practices, monitoring mechanisms,
          technical safeguards and periodic review or security audits.
        </p>
        <p>
          Access to personal data within Native91 may be limited to persons who
          reasonably require such access for legitimate business, operational,
          support, technical, legal or compliance purposes.
        </p>
        <p>
          Native91 may periodically review its security controls and procedures
          and implement improvements where reasonably necessary in light of
          technological developments, identified risks, operational requirements
          and applicable legal standards.
        </p>
        <p>
          No digital transmission or storage system can be guaranteed to be
          completely secure. Accordingly, while Native91 shall take reasonable
          measures to protect personal data, Users should also take reasonable
          precautions to protect their Account credentials, OTPs, passwords and
          devices.
        </p>
      </>
    ),
  },

  {
    icon: 22,
    title: "Account Credentials and User Responsibility",
    content: (
      <>
        <p>
          Users are responsible for maintaining the confidentiality of their
          Account credentials and should not share passwords, OTPs,
          authentication links or other security information with third parties.
        </p>
        <p>
          Native91 will not ordinarily request that a User disclose a password
          or OTP through an unsolicited communication. If a User believes that
          their Account has been accessed without authorisation, the User should
          notify Native91 promptly and take appropriate steps to secure the
          Account.
        </p>
        <p>
          Native91 may temporarily restrict or require re-verification of an
          Account where unusual or potentially unauthorised activity is
          detected. Such measures may be taken as a security precaution and
          shall not necessarily indicate wrongdoing by the User.
        </p>
      </>
    ),
  },

  {
    icon: 23,
    title: "Rights of the Data Principal",
    content: (
      <>
        <p>
          Subject to applicable law, a User may exercise rights available to a
          Data Principal in relation to personal data processed by Native91.
        </p>
        <p>
          Such rights may include requesting access to or a summary of personal
          data held by Native91 concerning the User, requesting correction or
          updating of inaccurate or incomplete personal data, withdrawing
          consent where processing is based upon consent, and requesting
          deletion of personal data where such deletion is legally available.
        </p>
        <p>
          The exercise of these rights may be subject to reasonable verification
          procedures designed to ensure that personal data is disclosed,
          modified or deleted only in response to an authentic request from the
          relevant Data Principal or an appropriately authorised person.
        </p>
        <p>
          Native91 may also retain information where retention is required by
          law or is otherwise permitted for legitimate purposes. Consequently, a
          request for deletion shall not necessarily result in immediate or
          complete deletion of every item of information where applicable law
          requires or permits continued retention.
        </p>
      </>
    ),
  },

  {
    icon: 24,
    title: "Right to Access Personal Data",
    content: (
      <>
        <p>
          Subject to applicable law and reasonable identity verification, a User
          may request information concerning the personal data held by Native91
          about the User.
        </p>
        <p>
          Depending upon applicable legal requirements, such information may
          include a summary or description of the personal data being processed
          and relevant information concerning its use.
        </p>
        <p>
          Native91 may request additional information where necessary to verify
          the identity of the requesting individual, particularly where
          disclosure of the requested information could otherwise create a risk
          of unauthorised access to another person's data.
        </p>
      </>
    ),
  },

  {
    icon: 25,
    title: "Correction and Updating of Information",
    content: (
      <>
        <p>
          Users may request correction of inaccurate or incomplete personal data
          held by Native91, subject to reasonable verification and applicable
          law.
        </p>
        <p>
          Where the User can update information directly through the Account
          interface, the User should ordinarily use the available self-service
          functionality. Where such functionality is unavailable or the
          requested correction cannot be made directly, the User may contact
          Native91 through the appropriate support or grievance channel.
        </p>
        <p>
          Native91 may require reasonable evidence or clarification where the
          requested correction concerns material identity, payment, Account or
          other information that could affect the security or integrity of the
          Platform.
        </p>
      </>
    ),
  },

  {
    icon: 26,
    title: "Withdrawal of Consent",
    content: (
      <>
        <p>
          Where Native91 processes personal data on the basis of consent, a User
          may withdraw such consent in accordance with the mechanisms made
          available by Native91 and applicable law.
        </p>
        <p>
          Withdrawal of consent shall not necessarily invalidate processing that
          was lawfully undertaken before withdrawal. It may also affect
          Native91's ability to continue providing particular features or
          services where the relevant processing is necessary for those features
          or services.
        </p>
        <p>
          For example, withdrawal of consent for promotional communications may
          result in the User no longer receiving certain marketing
          communications while transactional and service-related communications
          continue where necessary to fulfil an Order or administer the Account.
        </p>
        <p>
          Where consent is withdrawn, Native91 shall take reasonable steps
          consistent with applicable law to discontinue the relevant
          consent-based processing, subject to any lawful basis for continued
          processing.
        </p>
      </>
    ),
  },

  {
    icon: 27,
    title: "Right to Request Erasure",
    content: (
      <>
        <p>
          Subject to applicable law, a User may request deletion or erasure of
          personal data that is no longer necessary for the purpose for which it
          was collected or where another legally recognised ground for deletion
          applies.
        </p>
        <p>
          A deletion request shall be assessed against Native91's legal and
          operational obligations. Native91 may be required to retain certain
          information for taxation, accounting, consumer protection, fraud
          prevention, dispute resolution, legal proceedings, regulatory
          compliance or other legally recognised purposes.
        </p>
        <p>
          Where information cannot lawfully be deleted immediately, Native91 may
          retain the information for the required period and thereafter securely
          delete or anonymise it.
        </p>
      </>
    ),
  },

  {
    icon: 28,
    title: "Nomination in Case of Death or Incapacity",
    content: (
      <>
        <p>
          To the extent provided under the Digital Personal Data Protection Act,
          2023 and applicable rules, a User may nominate another individual to
          exercise applicable rights in relation to the User's personal data in
          the event of the User's death or incapacity.
        </p>
        <p>
          Native91 may require appropriate documentation and verification before
          recognising a nominee or processing a request made on behalf of a Data
          Principal who is deceased or incapacitated.
        </p>
        <p>
          The nomination mechanism shall operate subject to the requirements,
          procedures and limitations prescribed by applicable law from time to
          time.
        </p>
      </>
    ),
  },

  {
    icon: 29,
    title: "Children's Personal Data",
    content: (
      <>
        <p>
          Native91's Platform is not intended to be directed towards children
          below eighteen (18) years of age. Native91 does not knowingly seek to
          collect personal data from children without appropriate and verifiable
          consent of a parent or lawful guardian where such consent is legally
          required.
        </p>
        <p>
          Where Native91 becomes aware that personal data relating to a child
          has been collected in circumstances where the required parental or
          guardian consent was not obtained, Native91 shall take reasonable
          steps to assess the circumstances and, where appropriate and legally
          permissible, delete the relevant information.
        </p>
        <p>
          Parents and lawful guardians who believe that a child has provided
          personal data to Native91 without appropriate consent may contact
          Native91 through its designated support or grievance mechanism.
        </p>
      </>
    ),
  },

  {
    icon: 30,
    title: "Cross-border Processing and Transfer of Personal Data ",
    content: (
      <>
        <p>
          Native91 may use third-party service providers whose infrastructure,
          personnel or processing facilities are located outside India. Such
          service providers may include cloud-hosting providers, technical
          service providers, analytics providers, payment-processing partners
          and other vendors supporting the operation of the Platform.
        </p>
        <p>
          Where personal data is transferred, stored or processed outside India,
          Native91 shall seek to ensure that such processing is undertaken in
          accordance with the Digital Personal Data Protection Act, 2023 and
          other applicable Indian law, including any restrictions or
          requirements imposed by the Central Government from time to time.
        </p>
        <p>
          Where required or appropriate, Native91 may impose contractual
          safeguards upon relevant service providers requiring them to maintain
          appropriate confidentiality, security and privacy protections.
        </p>
        <p>
          The use of an overseas service provider does not by itself authorise
          unrestricted use of personal data. Such processing shall remain
          subject to the purposes for which the information was collected and
          the legal requirements applicable to Native91 and the relevant service
          provider.
        </p>
      </>
    ),
  },

  {
    icon: 31,
    title: "Third-party Service Providers",
    content: (
      <>
        <p>
          Native91 may engage third-party vendors and service providers to
          support Platform operations. These may include cloud-hosting
          providers, technology providers, customer-support service providers,
          analytics providers, payment processors, communication service
          providers, logistics providers and security vendors.
        </p>
        <p>
          Where such third parties process personal data on behalf of Native91,
          Native91 shall seek to ensure that access is limited to information
          reasonably necessary for the relevant service and that appropriate
          confidentiality and security obligations are maintained.
        </p>
        <p>
          Third-party service providers may operate under their own legal and
          regulatory obligations. Where applicable, Users may also be subject to
          the privacy policies and terms of such providers when directly
          interacting with their services.
        </p>
      </>
    ),
  },

  {
    icon: 32,
    title: " Data Breach and Security Incidents",
    content: (
      <>
        <p>
          Native91 shall maintain reasonable security practices intended to
          prevent and detect unauthorised access to personal data. Nevertheless,
          in the event of a security incident or personal data breach, Native91
          shall assess the nature, scope and potential cons equences of the
          incident and take reasonable steps to contain and mitigate its
          effects.
        </p>
        <p>
          Where a personal data breach is likely to result in harm to a Data
          Principal and applicable law requires notification, Native91 shall
          notify the relevant regulatory authority, including the Data
          Protection Board of India where applicable, and affected Users in the
          manner and within the timelines prescribed under the Digital Personal
          Data Protection Act, 2023 and applicable rules.
        </p>
        <p>
          Depending upon the circumstances, remedial measures may include
          securing affected systems, restricting unauthorised access,
          investigating the cause of the incident, cooperating with appropriate
          authorities, resetting credentials where necessary, providing relevant
          information to affected Users and taking reasonable measures to reduce
          potential adverse consequences.
        </p>
        <p>
          Native91 shall not delay legally required notification merely because
          an internal investigation remains ongoing where applicable law
          requires notification within a prescribed timeframe.
        </p>
      </>
    ),
  },

  {
    icon: 33,
    title: "User Responsibilities Following a Security Incident",
    content: (
      <>
        <p>
          Users should promptly notify Native91 if they suspect that their
          Account credentials have been compromised or that their personal
          information has been accessed or misused without authorisation.
        </p>
        <p>
          Users should also maintain reasonable security practices, including
          protecting passwords and OTPs, avoiding the sharing of authentication
          information and promptly reporting suspicious Account activity.
        </p>
        <p>
          Where Native91 provides security-related instructions following an
          incident, Users should reasonably cooperate with such instructions
          where necessary to protect their Accounts or personal data.
        </p>
      </>
    ),
  },
  {
    icon: 34,
    title: "Data Used for Legal, Tax and Regulatory Compliance",
    content: (
      <>
        <p>
          Native91 may retain and process personal data to satisfy obligations
          imposed by tax, accounting, consumer-protection, e-commerce,
          financial, regulatory or other applicable laws.
        </p>
        <p>
          Such information may include transaction records, invoices, payment
          information, Order history, refund information, communication records
          and other documentation necessary to demonstrate compliance.
        </p>
        <p>
          Even where a User requests Account closure or deletion, Native91 may
          continue retaining information that it is legally required to preserve
          for the relevant statutory period.
        </p>
        <p>
          Once the applicable retention period expires and there is no
          continuing lawful purpose for retention, Native91 shall take
          reasonable steps to securely delete or anonymise the relevant
          information.
        </p>
      </>
    ),
  },

  {
    icon: 35,
    title: "Grievance and Privacy Requests",
    content: (
      <>
        <p>
          Users may raise privacy-related requests, concerns or complaints
          through Native91's designated customer-support or grievance mechanism.
        </p>
        <p>
          A request should contain sufficient information to identify the User
          and the nature of the concern. Native91 may require reasonable
          verification before acting on requests involving access, correction,
          deletion, consent withdrawal or other rights concerning personal data.
        </p>
        <p>
          Where a request concerns a suspected data breach, unauthorised
          disclosure or other serious privacy incident, the User should provide
          available details concerning the incident so that Native91 can
          investigate the matter effectively.
        </p>
        <p>
          Native91 shall endeavour to address privacy-related requests within
          the timelines prescribed by applicable law.
        </p>
      </>
    ),
  },

  {
    icon: 36,
    title: "Account Closure and Deletion of Associated Personal Data",
    content: (
      <>
        <p>
          A User may request closure of their Native91 Account at any time,
          subject to the applicable Terms of Use and operational requirements.
        </p>
        <p>
          Upon receiving an Account closure request, Native91 may take
          reasonable steps to deactivate the Account and process associated
          personal data for deletion where deletion is legally and operationally
          permissible.
        </p>
        <p>
          Account closure shall not necessarily result in immediate deletion of
          all information. Native91 may retain records required for tax,
          accounting, consumer-protection, fraud prevention, dispute resolution,
          regulatory compliance, legal proceedings or other la wful purposes.
        </p>
        <p>
          Where personal data is no longer required and no lawful retention
          obligation applies, Native91 shall process the relevant information
          for deletion, anonymisation or de-identification in accordance with
          its applicable procedures.
        </p>
      </>
    ),
  },

  {
    icon: 37,
    title: "Effect of Account Closure on Pending Transactions",
    content: (
      <>
        <p>
          Closing an Account does not automatically cancel Orders that have
          already been placed or extinguish rights and obligations arising from
          completed transactions.
        </p>
        <p>
          Where an Order remains pending at the time of Account closure,
          Native91 may retain the information necessary to complete, cancel,
          deliver, refund, exchange or otherwise administer that Order.
        </p>
        <p>
          Similarly, records concerning disputes, refunds, chargebacks, consumer
          complaints or other unresolved matters may be retained for the period
          reasonably required to resolve the relevant issue or comply with
          applicable law.
        </p>
      </>
    ),
  },

  {
    icon: 38,
    title: " Protection Against Unauthorised Use of Personal Data",
    content: (
      <>
        <p>
          Native91 shall take reasonable steps to prevent personal data
          collected through the Platform from being used for purposes
          inconsistent with this Policy or applicable law.
        </p>
        <p>
          Internal access may be restricted according to legitimate operational
          requirements, and Native91 may monitor access to relevant systems
          where reasonably necessary for security, audit and compliance
          purposes.
        </p>
        <p>
          Where unauthorised access or misuse is detected, Native91 may
          investigate the matter and take appropriate technical, contractual or
          administrative action.
        </p>
      </>
    ),
  },

  {
    icon: 39,
    title: "Accuracy and Data Quality",
    content: (
      <>
        <p>
          Native91 seeks to maintain personal data that is reasonably accurate
          and appropriate for the purposes for which it is processed. However,
          the accuracy of certain information depends upon the information
          supplied by the User, Seller, payment provider or other source.
        </p>
        <p>
          Users are encouraged to review Account information periodically and up
          date inaccurate or outdated information where possible.
        </p>
        <p>
          Where inaccurate information results in failed delivery, unsuccessful
          communication, incorrect billing or other operational consequences,
          Native91 may rely upon the information provided by the User until
          corrected through the applicable process.
        </p>
      </>
    ),
  },

  {
    icon: 40,
    title: "Limits on Processing",
    content: (
      <>
        <p>
          Native91 shall seek to process personal data only to the extent
          reasonably necessary for the purposes identified in this Policy or
          otherwise permitted under applicable law.
        </p>
        <p>
          Native91 does not intend to collect personal data merely for its own
          sake. The categories and amount of information processed may vary
          depending upon the Platform feature being used, the nature of the
          transaction and the legal or operational requirements applicable to
          the relevant service.
        </p>
        <p>
          Where a particular feature requires additional personal data, the User
          may be informed through the relevant interface, notice or applicable
          terms.
        </p>
      </>
    ),
  },
  {
    icon: 41,
    title: "Changes to This Privacy Policy",
    content: (
      <>
        <p>
          Native91 may modify, update or replace this Privacy Policy from time
          to time to reflect changes in applicable law, regulatory requirements,
          technological developments, Platform functionality, business
          operations, data-processing practices or security measures.
        </p>
        <p>
          Where changes materially affect the manner in which personal data is
          processed or materially alter the rights or obligations of Users,
          Native91 shall provide notice through appropriate means in accordance
          with applicable law.
        </p>
        <p>
          The updated Policy shall become effective from the date specified in
          the revised version. Users are encouraged to periodically review the
          Policy so that they remain informed regarding the manner in which
          Native91 handles personal data.
        </p>
      </>
    ),
  },
  {
    icon: 42,
    title: "Relationship With Other Native91 Policies",
    content: (
      <>
        <p>
          This Privacy Policy forms part of the broader legal and operational
          framework governing the Native91 Platform. It should be read together
          with the Terms of Use, Cookie Policy, Buyer Policy. Seller Policy and
          other applicable Platform policies.
        </p>
        <p>
          The Privacy Policy specifically addresses the collection, processing,
          use, sharing, retention, protection and deletion of personal data.
          Other policies may address matters such as Platform conduct,
          transactions, shipping, refunds, cancellations, Seller obligations and
          acceptable use
        </p>
        <p>
          Nothing in another Native91 policy shall be interpreted as authorising
          processing of personal data in a manner inconsistent with applicable
          privacy and data-protection law.
        </p>
      </>
    ),
  },
  {
    icon: 43,
    title: "Compliance With Applicable Data-protection Law",
    content: (
      <>
        <p>
          Native91 shall seek to operate its personal-data practices in
          accordance with applicable Indian privacy and data-protection
          requirements, including the Digital Personal Data Protection Act, 2023
          and applicable rules, notifications and regulatory requirements
          thereunder as and when applicable.
        </p>
        <p>
          Native91 may update its systems, notices, consent mechanisms,
          contractual arrangements and internal procedures as necessary to
          reflect changes in the legal framework governing personal data.
        </p>
        <p>
          Where the law provides a specific right, obligation, restriction or
          procedural requirement that differs from the general framework
          described in this Policy, Native91 shall comply with the applicable
          legal requirement.
        </p>
      </>
    ),
  },
  {
    icon: 44,
    title: "Enforcement and Restriction of Platform Privileges",
    content: (
      <>
        <p>
          Native91 reserves the right to take reasonable measures where
          necessary to protect the security, integrity and lawful operation of
          the Platform. Such measures may include temporary restriction of
          Account functionality, additional identity verification, suspension of
          certain services or other proportionate safeguards where there is a
          reasonable concern regarding unauthorised access, fraudulent activity,
          misuse of personal data or violation of applicable Platform terms.
        </p>
        <p>
          Such measures shall be implemented subject to applicable law and shall
          not be used to unlawfully prevent a User from exercising statutory
          rights relating to personal data or consumer protection.
        </p>
        <p>
          A User who believes that a restriction has been imposed incorrectly
          may contact Native91 through the applicable support or grievance
          mechanism for review.
        </p>
      </>
    ),
  },
  {
    icon: 45,
    title: "Payment Processing Through Razorpay",
    content: (
      <>
        <p>
          Where a User makes or attempts to make a payment through Razorpay or
          any payment gateway integrated with the Native91 Platform, certain
          information necessary to initiate, authenticate, process, verify and
          reconcile the payment transaction may be shared with or processed by
          Razorpay and the relevant banks, card networks, UPI service providers
          and other financial intermediaries involved in the transaction. Such
          information may include transaction identifiers, payment status,
          amount, payment method, order-related information and other
          information reasonably necessary for processing and securing the
          payment transaction. Native91 does not require Users to provide their
          complete payment credentials directly to Native91 where such
          information is processed by the applicable payment gateway.
        </p>
        <p>
          Razorpay may process personal and transaction-related information in
          accordance with its own applicable privacy policy, terms and
          information-security practices. Native91 does not control the
          independent processing of information carried out by Razorpay or other
          third-party payment service providers. Users are therefore encouraged
          to review the applicable privacy terms of the relevant payment service
          provider before completing a transaction.
        </p>
        <p>
          Native91 may receive and retain limited payment-related information,
          including transaction references, payment status, confirmation details
          and other records necessary for order management, accounting, customer
          support, fraud prevention, dispute resolution, refunds, legal
          compliance and maintenance of transaction records. Native91 shall not
          ordinarily retain complete card numbers, CVV details, UPI PINs or
          other sensitive payment authentication credentials where such
          information is handled directly by the applicable payment gateway or
          financial institution.
        </p>
        <p>
          Where required for legitimate business purposes, fraud prevention,
          transaction reconciliation, customer support, refunds, chargeback
          management, dispute resolution or compliance with applicable law,
          Native91 may exchange relevant transaction information with Razorpay,
          the relevant financial institution, payment network, Seller, logistics
          provider or competent authority, to the extent reasonably necessary
          for the relevant purpose.
        </p>
        <p>
          The use of Razorpay or any other third-party payment service provider
          does not relieve Native91 of its obligations under applicable
          data-protection, consumer-protection or other applicable laws.
          Native91 shall take reasonable measures to protect the payment-related
          information available to it against unauthorised access, misuse,
          alteration, disclosure or loss, subject to the nature of the
          information and the limitations applicable to third-party payment
          infrastructure.
        </p>
      </>
    ),
  },
  {
    icon: 46,
    title: "Final Data Governance Framework",
    content: (
      <>
        <p>
          Native91's approach to personal data is based upon the principles of
          purpose limitation, reasonable necessity, responsible disclosure,
          appropriate retention and reasonable security. Personal data collected
          from Users is intended to support the functioning of the Platform,
          facilitate transactions, provide customer support, prevent fraud,
          improve User experience, fulfil legal obligations and perform other
          legitimate purposes identified in this Policy or permitted by
          applicable law.
        </p>
        <p>
          Native91 shall seek to ensure that information shared with Sellers,
          logistics providers, payment partners and other service providers is
          limited to information reasonably necessary for the relevant purpose.
          Native91 does not sell User personal data to third parties for their
          independent marketing purposes.
        </p>
        <p>
          Users retain applicable rights concerning their personal data,
          including rights relating to access, correction, consent withdrawal,
          erasure and nomination, subject to the Digital Personal Data
          Protection Act, 2023 and other applicable law. Native91 may retain
          information where legally required or reasonably necessary for
          legitimate purposes, including tax, accounting, consumer-protection,
          fraud-prevention and dispute-resolution requirements.
        </p>
        <p>
          In the event of a personal data breach requiring notification under
          applicable law, Native91 shall take reasonable steps to contain and
          mitigate the incident and provide required notifications to the
          appropriate authority and affected Data Principals within the legally
          prescribed framework.
        </p>
        <p>
          A User may request closure of their Account and deletion of associated
          personal data, subject to applicable retention obligations. Account
          closure shall not affect records that Native91 is legally required to
          retain or information reasonably necessary to resolve pending
          transactions, disputes, refunds, regulatory matters or other lawful
          obligations.
        </p>
        <p>
          This Policy is intended to provide a transparent framework for the
          handling of personal data while preserving all mandatory rights and
          protections available to Users under applicable law. Where any
          provision of this Policy is found to be inconsistent with a mandatory
          statutory requirement, the applicable statutory requirement shall
          prevail to the extent of such inconsistency, and the remaining
          provisions shall continue to operate to the maximum extent legally
          permissible.
        </p>
      </>
    ),
  },
];

const PrivacyPolicy = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  return (
    <>
      <div>
        {/* Header */}
        <Header />

        <section className="privacy-hero lexend">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 70 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content"
            >
              <FaShieldAlt className="hero-icon" />
              <h1>Privacy Policy</h1>
              <p>
                Your privacy matters to us. We are committed to protecting your
                personal information and ensuring a secure shopping experience.
              </p>
              <p data-aos="fade-up">Last Updated : September 2, 2026</p>
            </motion.div>
          </Container>
        </section>

        <section className="privacy-section lexend">
          <Container>
            <Row>
              <Col lg={3}>
                <div className="toc">
                  <h5>Contents</h5>

                  {sections.map((item, index) => (
                    <a href={`#section-${index}`} key={index}>
                      <b>{item.icon}.</b> {item.title}
                    </a>
                  ))}
                </div>
              </Col>

              <Col lg={9}>
                {sections.map((item, index) => (
                  <motion.div
                    key={index}
                    id={`section-${index}`}
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card className="privacy-card">
                      <Card.Body>
                        <div className="card-title">
                          <span>{item.icon}</span>
                          <h3>{item.title}</h3>
                        </div>

                        <div>{item.content}</div>
                      </Card.Body>
                    </Card>
                  </motion.div>
                ))}

                <motion.div
                  whileInView={{ opacity: 1, scale: 1 }}
                  initial={{ opacity: 0, scale: 0.9 }}
                >
                  <Card className="consent-card">
                    <Card.Body>
                      <FaCheckCircle />

                      <h3>Consent</h3>

                      <p>
                        By using our website, creating an account, or placing an
                        order, you acknowledge that you have read, understood,
                        and agreed to this Privacy Policy.
                      </p>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Container>
        </section>

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
};

export default PrivacyPolicy;
