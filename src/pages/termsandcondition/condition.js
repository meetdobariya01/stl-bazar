import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "./condition.css";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "aos/dist/aos.css";

const sections = [
  {
    title: "Eligibility, Account Creation And User Representations",
    list: [
      "Access to, registration with, and use of the Platform shall be subject to the User satisfying the eligibility and legal capacity requirements prescribed under applicable law and these Terms. Any individual who is competent to contract under the applicable provisions of the Indian Contract Act, 1872, including a person who has attained the age of eighteen (18) years, is of sound mind, and is not otherwise disqualified from entering into a contract by any law for the time being in force, may create and operate an Account on the Platform in accordance with these Terms. The eligibility requirements are intended to ensure that a person independently entering into transactions through the Platform possesses the legal capacity necessary to assume contractual obligations. A person who does not satisfy the applicable requirements of contractual capacity shall not independently register or operate an Account for the purpose of entering into transactions on the Platform.",

      "A minor may access or use the Platform only under the supervision and responsibility of a parent or lawful legal guardian. Where a minor is permitted to browse or otherwise access the Platform, any transaction intended to be undertaken on behalf of such minor shall be initiated, authorised, and completed through an Account validly registered and maintained by the relevant parent or legal guardian. The parent or legal guardian shall remain responsible for the use of the Account and for transactions undertaken through such Account, including compliance with these Terms and the other policies applicable to the Platform. Nothing contained in these Terms shall be construed as permitting a minor to independently create or operate an Account for the purpose of entering into contractual transactions where such capacity is not recognised under applicable law.",

      "Registration shall ordinarily require the User to provide a valid email address or mobile telephone number capable of receiving an authentication message or one-time password (OTP). Native91 may use OTP-based verification or such other reasonable authentication mechanisms as may be implemented from time to time for the purpose of verifying the contact information supplied by the User and establishing the authenticity of the Account. The User shall be responsible for ensuring that the information furnished at the time of registration is true, accurate, complete, current, and capable of being verified. The same obligation shall apply to information supplied or confirmed during checkout, including information necessary for processing an Order, payment, delivery, communication, or any other transaction undertaken through the Platform.",

      "The User shall not knowingly furnish false, fabricated, misleading, incomplete, or materially inaccurate information to Native91 for the purpose of obtaining access to the Platform, placing an Order, receiving a promotional benefit, circumventing an Account restriction, or otherwise obtaining an advantage to which the User is not legitimately entitled. Where information supplied by the User subsequently becomes inaccurate or outdated, the User shall, wherever the relevant functionality is made available, take reasonable steps to update such information. Native91 shall be entitled to rely upon the information provided by the User unless and until the User communicates a correction or Native91 otherwise becomes aware of a discrepancy.",

      "An Account is intended to represent a genuine User and shall not be created or maintained for fraudulent, deceptive, abusive, or unlawful purposes. A User shall not create multiple Accounts for the purpose of manipulating promotional schemes, referral benefits, introductory offers, discounts, coupons, or other incentives made available by Native91.",

      "The creation of multiple Accounts for legitimate and expressly permitted purposes shall not, by itself, constitute a breach; however, any use of multiple Accounts designed to evade restrictions, obtain duplicate benefits, conceal identity, manipulate Orders, or otherwise abuse Platform facilities shall constitute prohibited conduct. Native91 may take appropriate measures where it reasonably determines that Accounts have been created or used in a manner inconsistent with these requirements.",

      "No User shall impersonate another individual, business, organisation, Seller, representative, employee, or other legal or natural person, nor shall a User falsely represent that the User is affiliated with, authorised by, employed by, sponsored by, or otherwise connected with any person or entity where such affiliation does not exist. The User acknowledges that the identity and information associated with an Account may be relied upon by Native91 for purposes including transaction processing, customer support, fraud prevention, security, communications, and compliance with applicable law.",

      "By registering an Account or continuing to use the Platform, the User represents that the User satisfies the applicable eligibility requirements and undertakes to comply with these Terms and all other policies, rules, and conditions applicable to the User's use of the Platform. Native91 reserves the right to undertake reasonable verification where necessary for security, compliance, fraud prevention, or protection of the Platform and its participants.",
    ],
  },

  {
    title: " Nature Of Native91 Marketplace And Relationship With Sellers",
    list: [
      "Native91 operates the Platform as a curated online marketplace through which independent third-party Sellers may display, market, offer, and sell products to Users. For purposes of applicable law, Native91 operates as an intermediary within the meaning of Section 2(1)(w) of the Information Technology Act, 2000, to the extent applicable to the services and functions performed by it. The Platform is accordingly structured to facilitate interaction between Users and independent Sellers and to provide technological and operational infrastructure through which products may be discovered and transactions may be facilitated.",

      "Unless expressly identified otherwise in relation to a particular product, transaction, or arrangement, Native91 does not itself manufacture, produce, own, or maintain inventory of products listed by independent Sellers. The responsibility for the product offered through an individual listing ordinarily remains with the Seller that has listed such product. The Seller is responsible for determining the applicable product information, price, availability, applicable regulatory requirements, and other matters relating to the product, subject to the policies and standards imposed by Native91 and applicable law.",

      "Native91 may undertake curation and onboarding-related checks before permitting a Seller to participate in the marketplace. Such checks may be designed to assess the Seller and its offerings against Native91's applicable quality, curation, documentation, or marketplace standards. However, the existence of an onboarding or curation process shall not be construed as a representation that Native91 has independently manufactured, tested, certified, guaranteed, or assumed responsibility for every product listed by an independent Seller. To the maximum extent permitted by applicable law, the Seller remains responsible for ensuring that its products are genuine, lawful, compliant, accurately described, and fit for sale in accordance with the requirements applicable to that Seller and product category.",

      "Native91 does not, merely by making a product listing available through the Platform, become the manufacturer, producer, brand owner, importer, distributor, or seller of the relevant product. Native91's role is principally to provide and operate the marketplace infrastructure and to facilitate certain functions associated with the transaction. Such functions may include product discovery, communication, payment processing, and, during the initial phase of Native91's operations, coordination of logistics and delivery arrangements.",

      "Accordingly, except where expressly stated otherwise, the contract of sale concerning a particular product shall be formed directly between the User purchasing the product and the independent Seller offering that product. Native91 is not ordinarily a party to the underlying contract of sale merely because the transaction has been facilitated through the Platform. The User acknowledges that the contractual obligations relating specifically to the manufacture, supply, authenticity, description, quality, legality, and other characteristics of the product ordinarily rest with the relevant Seller, subject always to rights and remedies that may be available to the User under applicable law and Native91's policies.",

      "Nothing contained in this clause shall be interpreted as excluding, restricting, or diminishing any obligation imposed upon Native91 by mandatory law or any responsibility expressly undertaken by Native91 under these Terms or another applicable policy. The distinction between Native91 and the independent Seller is intended to accurately describe the marketplace structure and respective responsibilities of the parties and shall not operate to deprive a User of any non-excludable statutory right or remedy.",

      "Users are accordingly expected to review the relevant product listing, including descriptions, specifications, representations, certifications, warnings, pricing information, and other material made available in connection with the product before placing an Order. Native91 may establish additional standards governing Seller participation and product listings and may take measures in accordance with its policies where a Seller or listing is found to be inconsistent with those standards.",
    ],
  },

  {
    title: "Permitted Use, User Obligations And Prohibited Conduct",
    list: [
      "The User shall use the Platform solely for lawful and legitimate purposes and in accordance with these Terms, the Community Guidelines or Acceptable Use Policy, the applicable Refund, Return and Cancellation Policy, the Privacy Policy, Cookie Policy, and all other rules and policies forming part of the Native91 marketplace framework.",

      "The User shall conduct all activities on the Platform in a manner that does not unlawfully interfere with the rights, safety, security, privacy, property, business interests, or lawful activities of Native91, other Users, Sellers, service providers, or third parties.",

      "The Platform shall not be used for the uploading, transmitting, publishing, communicating, linking to, distributing, or otherwise making available of any material that is unlawful, defamatory, obscene, or infringes or unlawfully interferes with the intellectual property, privacy, contractual, proprietary, publicity, or other legal rights of any third party. A User shall not knowingly use the Platform to disseminate material where the User lacks the legal right or authorisation to make such material available. The foregoing restriction shall apply whether the material is directly uploaded to the Platform or is introduced or made accessible through a link, reference, embedded material, or other mechanism.",

      "The User shall not attempt to obtain unauthorised access to any portion of the Platform, including Native91's systems, networks, databases, technical infrastructure, administrative interfaces, security mechanisms, other Users' Accounts, Seller Accounts, Seller data, or information to which the User has not been granted access. Any attempt to circumvent authentication requirements, access controls, security mechanisms, technical restrictions, or other safeguards implemented by Native91 shall constitute a violation of these Terms. A User shall not seek to access, modify, obtain, copy, interfere with, or misuse information belonging to another User or Seller without appropriate authority.",

      "The User shall further refrain from employing bots, crawlers, spiders, scrapers, automated scripts, data-mining systems, or any comparable automated mechanism for the purpose of systematically accessing, extracting, reproducing, monitoring, collecting, indexing, or otherwise obtaining information from the Platform without the prior written consent of Native91. This restriction includes systematic extraction of product information, pricing information, Seller information, listing data, images, descriptions, or other Platform content. Ordinary browsing and use of the Platform through interfaces intentionally made available by Native91 shall not, merely by reason of being electronic or automated in nature, be treated as prohibited; however, any automated activity that exceeds the permitted functionality or materially interferes with Platform operations shall be subject to restriction.",

      "The User shall not place fraudulent, fictitious, deceptive, or otherwise illegitimate Orders.",

      "The User shall not knowingly interfere with the security, integrity, availability, or performance of the Platform or any systems connected with it. The User shall not introduce malicious code, harmful software, disruptive scripts, or other technological mechanisms designed or reasonably likely to damage, disable, overload, impair, compromise, or interfere with the Platform. A User shall also not engage in conduct intended to prevent or materially hinder other Users from accessing or using the Platform.",

      "Native91 reserves the right to investigate conduct that it reasonably believes may violate these Terms, applicable law, or the integrity of the Platform and may adopt proportionate measures available under these Terms and applicable policies. Such measures may include restricting access to specific functionalities, cancelling transactions where permitted, suspending an Account, restricting promotional or transactional privileges, or terminating the Account in appropriate circumstances.",

      "Similarly, the return, exchange, cancellation, refund, and other post-order mechanisms made available by Native91 shall be used only in accordance with the applicable policy and for legitimate purposes. A User shall not manipulate, abuse, or fraudulently invoke such mechanisms to obtain products, refunds, credits, benefits, or other advantages to which the User is not entitled. Nothing in this clause shall prevent a User from exercising a genuine right of cancellation, return, exchange, refund, or other remedy available under the applicable policy or mandatory law.",
    ],
  },

  {
    title: "Payment And Razorpay Payment Gateway",
    list: [
      "Native91 may make available payment methods including UPI, cards, net banking, digital wallets, supported EMI options and Cash-on-Delivery, subject to availability and eligibility. Payment services may be provided through third-party payment service providers and financial institutions.",

      "Razorpay may be used by Native91 as a third-party payment gateway and payment-processing intermediary. Where Razorpay is selected or routed as the applicable payment method, the Buyer submits the payment through the Razorpay-enabled payment flow, and the applicable transaction amount is processed through Razorpay and subsequently settled onward to Native91 in accordance with the relevant payment arrangement.",

      "Razorpay's role is limited to facilitating payment processing and related transaction services. Razorpay does not package, dispatch or deliver Products purchased through the Platform. Delivery, fulfilment and Seller obligations remain governed by the applicable marketplace arrangements.",

      "Native91 does not ordinarily store full card numbers, CVV details or net-banking credentials. Payment credentials and sensitive payment information may be processed by authorised payment service providers in accordance with their applicable security and privacy practices.",

      "Where a payment is debited but an Order is not confirmed, the transaction may be subject to reversal or refund through the payment gateway, issuing bank, card network, UPI system or other applicable payment infrastructure. Processing timelines may vary according to the payment method and financial institution.",

      "Where an Order is cancelled prior to dispatch after payment has already been received from the User, any amount refundable to the User shall be processed in accordance with the applicable Refund, Return and Cancellation Policy and the payment method or mechanism through which the transaction was completed. The timing of the actual credit may depend upon the relevant payment service provider, banking institution, or other financial intermediary involved in the transaction.",
    ],
  },

  {
    title: "Pricing, Taxes, Shipping Charges And Formation Of Orders",
    list: [
      "All product prices displayed on the Platform shall, unless otherwise expressly stated, be denominated in Indian Rupees (INR). The price applicable to a particular product shall ordinarily be the price displayed in the relevant listing or at checkout, subject to applicable corrections, availability, taxes, charges, promotional terms, and the other conditions governing the transaction. Unless expressly stated otherwise, the prices displayed on the Platform shall be inclusive of applicable Goods and Services Tax (GST).",

      "The User acknowledges that the final amount payable in connection with an Order may comprise more than the displayed product price. Shipping or delivery charges may be levied separately and may be calculated at checkout by reference to factors including, without limitation, the value of the User's cart and the applicable delivery location. The User shall be responsible for reviewing the amount presented at checkout before confirming the Order. Any applicable charges shall be displayed or otherwise communicated in accordance with the Platform's transaction flow and applicable law.",

      "Unless a specific provision of the applicable Refund, Return and Cancellation Policy expressly provides otherwise, shipping charges shall be non-refundable once the relevant Order has been dispatched. The treatment of shipping charges in connection with cancellation, return, non-delivery, defective products, or other circumstances shall be determined in accordance with the applicable policy and mandatory legal requirements.",

      "Native91 and/or the relevant Seller may correct pricing or product information where an error, omission, technical issue, inaccurate data, or other mistake has resulted in an incorrect display. The existence of an incorrect or erroneous price shall not, by itself, require Native91 or the relevant Seller to fulfil an Order at such erroneous price where cancellation or correction is otherwise permitted under applicable law and these Terms.",

      "Submission of an Order by a User shall constitute a request to purchase the relevant product on the terms displayed at the time of checkout and shall not, by itself, be treated as conclusive acceptance by Native91 or the relevant Seller. An Order shall be considered accepted only when an Order confirmation is issued by Native91 or the relevant Seller, as applicable. The User acknowledges that certain matters, including product availability, pricing accuracy, delivery serviceability, fraud screening, and other transaction-related considerations, may need to be verified before acceptance and dispatch.",

      "Native91 reserves the right to cancel an Order prior to dispatch where circumstances reasonably warrant such cancellation, including where the product is unavailable, the displayed price is materially erroneous, the transaction is reasonably suspected to involve fraud or abuse, the delivery location is outside the applicable serviceable area, or other serviceability constraints prevent fulfilment. The foregoing circumstances are illustrative and shall not restrict cancellation where otherwise permitted under applicable law or the applicable policies.",

      "The User acknowledges that product availability and delivery serviceability may vary depending upon the Seller, inventory position, delivery location, logistics conditions, and other operational circumstances. Native91 shall be entitled to communicate relevant limitations through the Platform and to take appropriate measures where an Order cannot reasonably be fulfilled.",
    ],
  },

  {
    title: "Amendments, Updates And Modification Of The Terms",
    list: [
      "Native91 reserves the right to amend, modify, supplement, replace, or otherwise revise these Terms from time to time in order to reflect changes in applicable law, regulatory requirements, business practices, commercial arrangements, technological developments, operational requirements, or the introduction, modification, or discontinuation of features and services offered through the Platform.",

      "An amendment may also be made where Native91 considers it necessary to clarify existing provisions, correct an ambiguity, improve the administration of the Platform, address emerging risks, or align the Terms with changes in the marketplace model. Any revised version shall become applicable from the effective date specified by Native91, subject to applicable law and any notice requirements prescribed herein.",

      "Where Native91 makes a material amendment to these Terms, registered Users shall be notified through an appropriate communication mechanism. Such notification may be provided by email, SMS, or by displaying a prominent notice on the Platform. Native91 shall provide notice of material amendments at least seven (7) days before the amended provisions are intended to take effect, unless a shorter period is required or permitted by applicable law due to an urgent legal, regulatory, security, or operational circumstance. The User shall be responsible for reviewing the revised Terms following receipt of such notification. Continued access to or use of the Platform after the effective date of an amendment shall constitute the User's acceptance of the revised Terms, subject to any rights available to the User under applicable law.",

      "Where the User does not agree to a material amendment, the User may discontinue use of the Platform and may request closure of the Account in accordance with the applicable Account closure procedure. Such discontinuance shall not extinguish any rights, liabilities, payment obligations, Orders, or other matters that accrued prior to closure or that by their nature are intended to survive such closure.",

      "The latest version of these Terms made available by Native91 shall govern the User's continued use of the Platform from its stated effective date. Users are therefore encouraged to periodically review the applicable version of the Terms and other Platform policies.",
    ],
  },

  {
    title:
      " Account Security, Authentication And Protection Against Unauthorised Use",
    list: [
      "Native91 may employ OTP-based two-factor verification and other reasonable authentication mechanisms to protect User Accounts. Verification may be undertaken during registration, login, Account recovery, or other circumstances where Native91 considers additional authentication reasonably necessary for security or fraud prevention. An OTP may be transmitted to the mobile number or email address registered with the relevant Account.",

      "The User shall maintain the confidentiality of all authentication information associated with the Account, including OTPs, passwords, verification codes, login credentials, and active login sessions. The User shall not knowingly disclose such information to any third party. In particular, a User should not provide an OTP or authentication code to a person merely because such person claims to be a representative, employee, Seller, delivery agent, or service provider of Native91.",

      "The User shall also exercise reasonable care when accessing the Platform through a shared, public, borrowed, or otherwise accessible device. Where an Account has been accessed from such a device, the User should log out after completing the relevant session and should take reasonable steps to ensure that the Account cannot subsequently be accessed by an unauthorised person.",

      "The User acknowledges that the confidentiality of Account credentials is an important component of Account security. The User shall therefore take reasonable precautions against loss, disclosure, theft, misuse, or unauthorised access to authentication information. If the User becomes aware of or reasonably suspects that the Account has been compromised, accessed without authorisation, or used by another person, the User shall notify Native91 immediately through customer support or by contacting the Grievance Officer identified under the applicable grievance mechanism.",

      "Upon receiving information concerning suspected unauthorised Account access, Native91 may take reasonable protective measures, including requiring re-verification, temporarily restricting the Account, reviewing suspicious activity, securing access, or investigating Orders that may have been placed without the User's authorisation. The User shall reasonably cooperate with such verification or investigation where necessary to secure the Account and protect the interests of the User and other participants on the Platform.",

      "Native91 may employ systems or processes designed to detect unusual login or Account activity. Such activity may include, by way of illustration, an attempted login from an unrecognised device, an unusual location, an atypical access pattern, or other activity reasonably indicative of a potential security risk. Detection of such activity shall not necessarily constitute a finding of misconduct against the User; it may result in precautionary measures designed to protect the Account.",

      "Where unusual activity is detected, Native91 may require additional verification before permitting continued access to the Account. Native91 may also temporarily lock, suspend, or restrict the Account as a precaution where it reasonably believes that such action is necessary to protect the User, Native91, other Users, Sellers, or the Platform. Native91 shall notify the User as appropriate regarding such protective action.",

      "The User acknowledges that security measures may occasionally require additional verification or temporary restrictions even where the User has not personally engaged in prohibited conduct. Such measures are intended to reduce the risk of unauthorised access and shall be administered in accordance with applicable law and Native91's security procedures.",
    ],
  },

  {
    title: "Force Majeure And Circumstances Beyond Reasonable Control",
    list: [
      "Neither Native91 nor any independent Seller shall be liable for any failure, interruption, inability, or delay in performing an obligation under these Terms to the extent that such failure or delay is directly attributable to circumstances beyond the reasonable control of the party affected by the relevant event. Such circumstances may include events commonly recognised as force majeure events and may materially affect the ability of Native91 or a Seller to perform obligations within the expected time.",

      "Without limiting the generality of the foregoing, such circumstances may include natural disasters, floods, earthquakes, severe weather events, pandemics, epidemics, strikes, labour disruptions, riots, civil disturbances, war, hostilities, governmental action, governmental restrictions, regulatory intervention, interruptions in internet services, telecommunications failures, widespread technical disruptions, or disruption affecting logistics, transportation, warehousing, courier, or delivery networks.",

      "The examples specified above are illustrative and shall not be interpreted as an exhaustive list of circumstances beyond reasonable control. The relevant determination shall have regard to the nature of the event, its impact upon performance, the reasonable ability of the affected party to prevent or overcome its consequences, and other circumstances relevant under applicable law.",

      "Where a force majeure event prevents or materially delays performance, the affected obligation may remain suspended or delayed for the period during which the relevant event continues to prevent reasonable performance. Neither Native91 nor the relevant Seller shall be required to perform an obligation that has become temporarily impracticable solely because of circumstances beyond reasonable control, provided that the affected party acts reasonably in responding to the circumstances.",

      "Native91 or the relevant Seller may take reasonable operational measures to minimise the effect of such events, including modifying delivery arrangements, communicating delays, temporarily restricting serviceability, or adopting alternative operational procedures.",

      "The existence of a force majeure event shall not, by itself, terminate this Agreement or extinguish obligations that are capable of being performed independently of the affected event.",

      "Performance of the affected obligation shall resume as soon as reasonably practicable after the relevant circumstances cease or are sufficiently reduced so as to permit performance. Where a force majeure event affects an Order, delivery, communication, payment process, or other transaction-related activity, the User shall be subject to the remedies and procedures available under the applicable Platform policies and mandatory law.",

      "Nothing in this clause shall be interpreted as excluding any liability or statutory obligation that cannot lawfully be excluded or limited.",
    ],
  },

  {
    title:
      "Entire Agreement, Severability, Assignment And Continuing Effect",
    list: [
      "These Terms, when read together with the Native91 Privacy Policy, Cookie Policy, Refund, Return and Cancellation Policy, Community Guidelines or Acceptable Use Policy, and the other applicable chapters, schedules, policies, or terms governing use of the Platform, constitute the principal contractual framework between the User and Native91 in relation to the User's access to and use of the Platform. The documents forming part of this framework shall be read together wherever reasonably possible so as to give effect to their respective provisions.",

      "This Agreement supersedes prior communications, representations, understandings, arrangements, or agreements between the User and Native91 concerning the same subject matter to the extent that such prior arrangements are inconsistent with the present Terms, except where a particular representation or obligation is expressly preserved, incorporated, or required by applicable law. Nothing in this provision shall affect any mandatory statutory right, obligation, or remedy that cannot lawfully be excluded by agreement.",

      "If any provision of these Terms, or any portion thereof, is determined by a court, tribunal, or other competent authority to be invalid, unlawful, void, or unenforceable, such determination shall not affect the validity or enforceability of the remaining provisions. The affected provision shall, to the extent legally permissible, be interpreted or enforced in a manner that most closely gives effect to its intended lawful purpose. Where such provision cannot be enforced, it shall be treated as severed only to the extent necessary, while the remaining provisions shall continue in full force and effect.",

      "The User shall not assign, transfer, delegate, novate, or otherwise dispose of any rights or obligations arising under these Terms without the prior written consent of Native91. This restriction is intended to preserve the personal and Account-specific nature of the User's relationship with the Platform and to prevent unauthorised transfer of Account rights or contractual obligations to another person. The User shall not transfer an Account to another person merely by providing login credentials or access information.",

      "Native91 may assign or transfer its rights and obligations under these Terms in connection with a merger, acquisition, corporate restructuring, sale or transfer of its business, transfer of the Platform, or other similar corporate transaction. Native91 shall provide notification to Users where such notification is required under applicable law or the relevant transaction arrangements. Such assignment shall not, by itself, extinguish obligations or rights otherwise applicable to the User.",

      "The termination, suspension, closure, or expiry of an Account shall not automatically discharge obligations or liabilities that arose prior to such event. Provisions which by their nature are intended to continue after termination or closure shall remain applicable to the extent legally permissible. Orders already placed, pending fulfilment, outstanding payments, refunds, returns, disputes, liabilities, or other accrued matters shall continue to be governed by the applicable terms notwithstanding the closure or termination of an Account.",
    ],
  },

  {
    title:
      " Suspension, Termination, Restriction Of Privileges And Voluntary Account Closure",
    list: [
      "Native91 reserves the right, subject to applicable law, to suspend, restrict, disable, terminate, or otherwise limit a User's Account or access to particular Platform functionalities where the User breaches these Terms, violates the Community Guidelines or Acceptable Use Policy, engages in fraudulent or abusive conduct, violates applicable law, attempts to compromise the security of the Platform, or otherwise acts in a manner that Native91 reasonably considers necessary to address in order to protect the integrity, security, reliability, or lawful operation of the Platform.",

      "Depending upon the nature and seriousness of the relevant circumstances, Native91 may impose a temporary or permanent restriction. Such action may be taken with or without prior notice where reasonably necessary, subject always to applicable law. The purpose of such action may include preventing continued misuse, protecting other Users or Sellers, preventing fraudulent transactions, securing Platform systems, complying with legal requirements, or preserving the integrity of the marketplace.",

      "Circumstances warranting restriction may include, without limitation, the use of fraudulent information, creation of multiple Accounts for promotional abuse, impersonation, fraudulent Orders, repeated misuse of COD, abusive use of cancellation or return mechanisms, unauthorised access attempts, automated scraping without permission, infringement of third-party rights, unlawful conduct, or other conduct inconsistent with these Terms.",

      "Native91 may also restrict specific privileges without terminating the entire Account. For example, where circumstances warrant, Native91 may restrict access to promotional benefits, COD facilities, particular transaction features, or other functionalities while continuing to permit limited use of the Platform. The nature and extent of any restriction may depend upon the circumstances giving rise to the action and the legitimate interests Native91 is seeking to protect.",

      "A User whose Account or privileges have been restricted shall not attempt to circumvent such restriction through another Account, false identity, another person's Account, technological means, or any other unauthorised method. Any attempt to evade an Account restriction may constitute an additional breach and may result in further enforcement action.",

      "A User may voluntarily request closure of their Account at any time by communicating the request to the Grievance Officer identified in the applicable grievance mechanism. Native91 may require reasonable verification of the User's identity before processing the request, particularly where such verification is necessary to prevent unauthorised Account closure or to protect pending transactions.",

      "Closure of an Account shall not affect Orders that have already been placed and remain pending fulfilment. Pending Orders may continue to be processed, delivered, cancelled, returned, refunded, or otherwise dealt with in accordance with the applicable policies. Similarly, closure shall not extinguish any payment obligation, liability, dispute, refund matter, return matter, or other obligation that accrued prior to closure.",

      "Where an Account is terminated by Native91 due to a breach, the User shall remain responsible for obligations or liabilities accrued before termination and shall not be entitled to use termination as a means of avoiding such obligations. Where a User voluntarily closes an Account, such closure shall be without prejudice to rights and obligations that have already accrued between the parties.",
    ],
  },

  {
    title:
      "Seller Compliance Representations, Warranties And Continuing Undertakings",
    list: [
      "A. Acceptance And Continuing Nature Of Seller Declarations",

      "As a condition of registration and participation as a Seller on the Native91 Platform, every Seller shall be required to accept the applicable Seller terms and compliance requirements through the designated onboarding or click-wrap mechanism. By registering as a Seller and, separately, by submitting, activating, or continuing any product listing on the Platform, the Seller represents, warrants, confirms, and undertakes that the declarations contained in this Clause are true, accurate, complete, and not misleading.",

      "The declarations set out herein shall constitute continuing representations and warranties and shall not be treated as statements made only on the date of initial Seller registration. Each declaration shall apply to the Seller and every relevant product listed by the Seller for so long as that Seller or product remains active on the Platform. The Seller shall accordingly be responsible for monitoring its continued compliance and for ensuring that circumstances arising after onboarding do not render any representation inaccurate or misleading.",

      "The Seller acknowledges that Native91's onboarding, curation, documentation, or quality checks do not relieve the Seller of its independent legal responsibilities. The Seller remains responsible for understanding and complying with all laws, regulations, mandatory standards, licensing requirements, labelling requirements, intellectual property requirements, and other regulatory obligations applicable to its business and products.",

      "Where a declaration becomes inaccurate, incomplete, or incapable of being maintained, the Seller shall immediately take appropriate corrective action and shall notify Native91 in writing in accordance with these Terms.",

      "B. Authority And Legal Right To Manufacture, Distribute And Sell",

      "The Seller represents and warrants that it possesses full and lawful right, title, authority, permission, and capacity to manufacture, where applicable, distribute, market, offer, and sell every product listed by it through the Platform. The Seller further warrants that such right and authority extends to India and, where relevant, to each State, Union Territory, jurisdiction, or geographical area to which the Seller offers or permits delivery of the relevant product.",

      "The Seller shall be solely responsible for obtaining, maintaining, renewing, and complying with all licences, registrations, permissions, approvals, certificates, authorisations, consents, and other regulatory requirements applicable to the manufacture, distribution, marketing, storage, transportation, advertising, offering, or sale of its products. Where a product category is governed by specialised legislation or regulatory requirements, the Seller shall independently determine the requirements applicable to that category and shall ensure compliance before listing or selling the product.",

      "The Seller shall not list or continue to offer a product where the Seller lacks the necessary legal authority or where a required licence, registration, approval, or authorisation has expired, been suspended, withdrawn, cancelled, or otherwise ceased to remain valid. Native91's acceptance of Seller or product listing shall not be construed as confirmation that the Seller has satisfied every legal or regulatory requirement applicable to its business.",

      "The Seller acknowledges that regulatory obligations may vary depending upon the nature of the product, its ingredients, composition, intended use, place of manufacture, packaging, method of distribution, destination, or other relevant circumstances. It shall therefore remain the Seller's responsibility to identify and comply with the requirements applicable to each product.",

      "C. Accuracy, Truthfulness And Substantiation Of Product Claims",

      "The Seller represents and warrants that all information submitted in connection with a product listing shall be true, accurate, complete to the extent required, current, and not misleading. This obligation shall apply to product names, descriptions, specifications, characteristics, dimensions, quantities, ingredients, representations, claims, images, certifications, origin statements, promotional material, and all other information communicated to Users through the Platform.",

      "The Seller shall ensure that any claim concerning the origin, method of manufacture, composition, characteristics, quality, sustainability, ingredients, or other attributes of a product is supported by an appropriate factual and lawful basis. Claims such as handmade, organic, natural, chemical-free, or comparable descriptions shall not be used where the Seller cannot substantiate the relevant representation or where such representation would mislead a reasonable consumer.",

      "Where the Seller refers to a certification, approval, standard, registration, award, testing result, or other form of accreditation, the Seller shall ensure that such reference is genuine, valid, applicable to the relevant product, and capable of being substantiated where required. The Seller shall not use expired, withdrawn, irrelevant, fabricated, altered, or otherwise misleading certification information in a product listing.",

      "Images and other visual material supplied by the Seller shall accurately represent the product being offered and shall not materially mislead Users concerning the product's appearance, nature, characteristics, quantity, composition, packaging, or intended use. The Seller shall ensure that stock images, illustrations, representations, or modified images do not create a false impression regarding the actual product.",

      "The Seller shall not make any claim that is prohibited under applicable law. In particular, a product listing shall not contain an unlicensed therapeutic, disease-cure, medical, or drug-efficacy claim. A Seller shall not represent that a product can diagnose, cure, prevent, treat, or otherwise produce a medical or therapeutic result unless the relevant representation is lawfully authorised and adequately substantiated.",

      "The Seller acknowledges that misleading claims may affect consumer decision-making and may expose the Seller and, where applicable, other participants to legal, regulatory, or contractual consequences. The Seller shall accordingly exercise due diligence in preparing and maintaining every product listing.",

      "D. Authenticity, Mandatory Standards And Product Compliance",

      "The Seller represents and warrants that every product listed on the Platform is genuine and lawfully offered for sale. The Seller shall not list, advertise, distribute, or sell counterfeit products, unauthorised replicas, fraudulent imitations, or other goods whose manufacture, possession, distribution, or sale unlawfully infringes the rights of another person.",

      "The Seller shall be responsible for maintaining appropriate records and documentation demonstrating the genuine and lawful nature of its products where such documentation is required by applicable law or reasonably requested in connection with a compliance review. The Seller shall cooperate with reasonable verification processes undertaken by Native91 concerning product authenticity, legality, regulatory compliance, or other marketplace requirements.",

      "Every product shall comply with all mandatory standards, safety requirements, regulatory conditions, and category-specific obligations applicable to that product. Depending upon the nature of the product, such requirements may include standards or obligations administered or prescribed by the Bureau of Indian Standards (BIS), Food Safety and Standards Authority of India (FSSAI), Legal Metrology authorities, requirements under the Drugs and Cosmetics Act and rules made thereunder, and any other applicable central, State, local, sector-specific, or category-specific law, regulation, standard, notification, order, or mandatory requirement.",

      "The Seller shall ensure that the product satisfies all applicable requirements before it is listed for sale and throughout the period during which it remains available through the Platform. Where applicable law requires specific physical labelling, the Seller shall ensure that the product and its packaging carry all mandatory declarations and information in the prescribed manner.",

      "Such labelling may, depending upon the relevant product category and applicable law, include information concerning quantity, composition, ingredients, manufacturer, importer, batch or lot details, dates, warnings, usage instructions, statutory declarations, certifications, or other information required to be displayed. The Seller shall remain responsible for determining which requirements apply to its products.",

      "The Seller shall not remove, conceal, falsify, alter, or otherwise interfere with mandatory information required to appear on a product or its packaging. Any product supplied to a User shall comply with the labelling and packaging requirements applicable at the time of supply.",

      "Native91's acceptance or continued display of a product listing shall not constitute certification, approval, or independent confirmation by Native91 that the Seller has complied with every product-specific regulatory requirement.",

      "E. Intellectual Property Rights And Seller Authority",

      "The Seller represents and warrants that it owns, controls, or otherwise possesses a valid and legally sufficient right or licence to use all intellectual property incorporated into or associated with products listed on the Platform and all content supplied by the Seller in connection with such listings.",

      "This representation shall include, where applicable, trademarks, trade names, logos, designs, photographs, illustrations, written descriptions, artwork, packaging designs, copyrighted material, product imagery, promotional content, and other intellectual property appearing in or associated with the products or listings.",

      "The Seller shall not upload, display, reproduce, distribute, or otherwise use intellectual property belonging to another person unless the Seller possesses the necessary ownership right, licence, permission, authorisation, or other lawful basis for such use. Where the Seller relies upon a licence, the licence shall remain valid and shall be sufficiently broad to cover the relevant use on the Native91 Platform and in connection with the Seller's product listing.",

      "The Seller shall not use another person's trademark, brand identity, copyrighted material, design, or other protected content in a manner that falsely suggests sponsorship, endorsement, affiliation, ownership, authorisation, or association where no such relationship exists.",

      "The Seller further represents that the products themselves do not unlawfully infringe any third party's intellectual property rights. Where the Seller becomes aware of an allegation, notice, dispute, claim, or proceeding concerning the intellectual property associated with a listed product or its content, the Seller shall promptly evaluate the matter and take appropriate steps in accordance with applicable law and its obligations to Native91.",

      "The Seller shall maintain, where appropriate, records sufficient to demonstrate ownership or licensing rights relating to intellectual property used in its product listings. Native91 may require reasonable information or documentation for purposes of investigating an alleged infringement or conducting a compliance review.",

      "F. Regulatory Notices, Product Recalls And Enforcement Status",

      "The Seller represents and warrants that, as of the date on which each product is listed, it is not subject to any regulatory notice, product recall, enforcement action, licence suspension, regulatory prohibition, or other governmental or regulatory measure that would render the relevant product non-compliant, unsafe, or unlawful for sale.",

      "The Seller shall continuously monitor the regulatory status of its business and products and shall take reasonable steps to identify any development that could affect the legality, safety, compliance, or continued sale of a product listed on Native91.",

      "Where the Seller receives a regulatory notice, recall communication, enforcement notice, licence suspension, safety warning, prohibition, or other regulatory communication concerning a product offered through the Platform, the Seller shall promptly assess the implications of that communication and shall notify Native91 in writing where the matter may affect the continued listing or sale of the relevant product.",

      "A Seller shall not knowingly continue to offer a product where a competent authority has prohibited its sale, where the product has become unsafe for sale, or where a required regulatory authorisation has ceased to remain valid. The Seller shall take appropriate action concerning affected inventory and listings in accordance with applicable law.",

      "Where Native91 becomes aware of information indicating a potential regulatory or product safety issue, it may take appropriate marketplace measures, including seeking information or documentation from the Seller, temporarily restricting the relevant listing, suspending availability, or taking other action consistent with applicable law and the relevant Seller terms.",

      "G. Continuing Duty To Notify Native91 Of Material Changes",

      "The Seller's representations and warranties under this Agreement are continuing in nature. Accordingly, the Seller shall immediately notify Native91 in writing of any change in circumstances that causes, or may reasonably cause, any representation or declaration made under these Terms to become inaccurate, incomplete, misleading, or incapable of being maintained.",

      "Such changes shall include, without limitation, the expiry, suspension, cancellation, withdrawal, or loss of a licence or registration; receipt of a regulatory notice; initiation of an enforcement action; identification of a product safety concern; discovery that product does not satisfy an applicable mandatory standard; receipt of an intellectual property infringement claim; or any other material development affecting the legality or continued sale of a product.",

      "The Seller shall not knowingly permit a product to remain listed under circumstances where information previously supplied to Native91 is no longer accurate in a material respect. Where necessary, the Seller shall promptly correct, suspend, withdraw, or otherwise modify the affected listing and shall provide Native91 with such information as may reasonably be required to assess the matter.",

      "The obligation to notify Native91 shall not be limited to circumstances in which a regulatory authority has already taken formal action. Where the Seller becomes aware of a genuine product safety issue or other material compliance concern that may reasonably affect Users or the legality of the product, the Seller shall act promptly and shall communicate the relevant information to Native91.",

      "H. Seller's Independent Compliance Responsibility",

      "The Seller acknowledges and agrees that participation in the Native91 marketplace does not transfer the Seller's statutory, regulatory, contractual, or commercial responsibilities to Native91. The Seller remains independently responsible for ensuring that its business operations and every product listed through the Platform comply with all applicable requirements.",

      "Native91 may undertake onboarding, curation, verification, quality, or compliance-related processes as part of its marketplace operations. Such processes are intended to support the administration and curation of the Platform and shall not be construed as a substitute for the Seller's own legal and regulatory due diligence.",

      "The Seller shall remain responsible for obtaining professional, regulatory, technical, or legal advice where necessary to determine the requirements applicable to its products.",

      "Native91 shall not be deemed to have undertaken the Seller's statutory responsibilities merely because Native91 has permitted a Seller or product to appear on the Platform.",

      "The Seller shall ensure that the information provided to Native91 during onboarding and throughout the Seller's participation remains accurate and complete. Where Native91 reasonably requests information concerning licences, registrations, certifications, product standards, intellectual property rights, product safety, regulatory status, or other compliance matters, the Seller shall provide the relevant information or documentation to the extent required under the applicable terms and law.",

      "Failure by a Seller to maintain the warranties and representations contained in this Clause may result in appropriate action under the applicable Seller terms, including review, restriction, suspension, removal of listings, suspension of Seller privileges, or termination of the Seller's participation, subject to applicable law.",

      "I. Effect Of Seller Click-Wrap Acceptance",

      "The Seller's electronic acceptance of the applicable Seller terms during onboarding shall constitute an acknowledgement that the Seller has read and accepted the contractual and compliance requirements governing participation in the Native91 marketplace.",

      "By listing each individual product, the Seller shall be deemed to reaffirm the continuing applicability of the representations and warranties contained in this Clause to that product.",

      "A Seller shall not rely upon the passage of time, Native91's continued availability of a listing, or the absence of an earlier compliance objection as a waiver of the Seller's continuing obligations.",

      "The Seller acknowledges that each product listing represents a continuing representation to the marketplace that the product is lawfully capable of being offered for sale, accurately represented, genuine, compliant with applicable mandatory requirements, and supported by the rights and authorisations represented by the Seller.",

      "The Seller shall therefore remain responsible for promptly identifying and correcting any circumstance that renders a previous representation inaccurate. Native91's receipt of notification from a Seller concerning such circumstances shall not, by itself, prevent Native91 from taking reasonable protective or compliance measures in relation to the affected listing.",

      "J. Preservation Of Applicable Law And Statutory Rights",

      "Nothing contained in these Terms, including the provisions concerning Native91's role as an intermediary, the User's responsibilities, Seller warranties, Account restrictions, Order cancellation, or other contractual arrangements, shall be interpreted as excluding or limiting any obligation, right, remedy, or protection that cannot lawfully be excluded or restricted under applicable law.",

      "Where a mandatory provision of law applies to a User, Seller, Native91, product, Order, transaction, or Platform activity, such provision shall continue to apply notwithstanding anything contained in these Terms.",

      "These Terms are intended to regulate access to and use of the Platform and to define the respective contractual responsibilities of Users, Sellers, and Native91. They shall not be construed as permitting any party to disregard applicable statutory requirements, regulatory standards, consumer protections, product safety obligations, intellectual property rights, or other mandatory legal requirements.",

      "In the event of any circumstance in which compliance with applicable law requires a different treatment from that contemplated by a contractual provision, the relevant provision shall be applied to the maximum extent legally permissible and shall be interpreted consistently with the applicable mandatory legal requirement.",

      "K. Survival Of Seller Representations And Compliance Obligations",

      "The Seller's obligations concerning product legality, authenticity, regulatory compliance, intellectual property rights, accuracy of product information, mandatory standards, licensing, product safety, and notification of material changes shall continue for so long as the relevant product remains listed, available, supplied, or otherwise connected with the Seller's participation on the Platform, to the extent applicable.",

      "The removal of product listing shall not automatically extinguish obligations, liabilities, or responsibilities arising from products previously listed or sold through the Platform. Similarly, suspension or termination of a Seller Account shall not discharge obligations or liabilities that arose before such suspension or termination.",

      "The Seller shall remain responsible for addressing regulatory, consumer, intellectual property, safety, or other issues relating to products previously offered through the Platform where such responsibility survives under applicable law or the relevant contractual arrangement.",

      "Native91 may retain and use information reasonably necessary to administer outstanding matters, investigate transactions, address compliance concerns, respond to legal requirements, or protect the legitimate interests of Users, Sellers, and the Platform, subject to the applicable Privacy Policy and law.",

      "L. General Compliance Undertaking",

      "By participating in the Native91 marketplace, the Seller confirms that it understands the distinction between Native91's role as a marketplace intermediary and the Seller's independent responsibility for the products it lists. The Seller undertakes to conduct its activities lawfully, maintain all required permissions and approvals, provide truthful and substantiated information, offer only genuine and compliant products, respect third-party intellectual property rights, comply with mandatory product standards and labelling requirements, and promptly disclose material changes affecting its compliance status.",

      "The Seller further acknowledges that the continued availability of a product on the Platform is conditional upon compliance with the applicable Seller terms, Platform policies, and law. Where a Seller becomes aware of any circumstance affecting the legality, safety, authenticity, regulatory status, or accuracy of a product listing, it shall take prompt and appropriate corrective action and notify Native91 where required.",

      "The Seller understands that Native91 may take reasonable enforcement or protective measures where necessary to maintain the integrity of the marketplace, protect Users, respond to regulatory requirements, investigate suspected non-compliance, or address risks arising from a product or Seller.",
    ],
  },

  {
    title: " Final Acknowledgement By Users And Sellers",
    list: [
      "By creating an Account or otherwise using the Platform, each User acknowledges that access to the Platform is subject to these Terms and the other policies applicable to the Native91 marketplace. The User agrees to provide accurate information, protect Account credentials, use the Platform lawfully, refrain from fraudulent or abusive conduct, respect the security and integrity of the Platform, and comply with the applicable conditions governing Orders, payments, cancellations, returns, exchanges, and other transactions.",

      "The User further acknowledges that Native91 operates a marketplace through which independent Sellers offer products and that, except where expressly stated otherwise, the contract of sale for an individual product is between the User and the relevant Seller. Native91 may facilitate product discovery, payment processing, and logistics coordination without thereby becoming the manufacturer or seller of products offered by independent Sellers.",

      "By registering as a Seller, accepting the applicable Seller terms, or listing a product on the Platform, the Seller confirms that the representations and warranties contained in Clause 13 are continuing obligations. The Seller confirms that it has the necessary authority and approvals to offer its products for sale, that the information and claims supplied by it are truthful and substantiated, that its products are genuine and compliant with applicable mandatory standards, that it possesses the necessary intellectual property rights, and that it will promptly notify Native91 of any material change affecting the accuracy of those representations.",

      "All Users and Sellers shall be responsible for complying with the provisions applicable to them and for using the Native91 Platform in a manner consistent with these Terms, the other applicable Native91 policies, and all mandatory requirements of law. Nothing in these Terms shall prevent Native91, a User, or a Seller from exercising any right or remedy that is mandatorily available under applicable law.",
    ],
  },
];

const Condition = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant", // or "smooth"
    });
  }, [pathname]);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });

    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;

      const current = window.scrollY;

      setProgress((current / total) * 100);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <div>
      {/* Header */}
      <Header />

      <div className="terms-page lexend">
        <div className="progressBar" style={{ width: `${progress}%` }}></div>

        <section className="hero">
          <div className="container">
            <h1 data-aos="fade-down">Terms & Conditions</h1>

            <p data-aos="fade-up">Last Updated : September 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <div className="toc sticky-top">
                <h5>Contents</h5>

                <ul>
                  {sections.map((item, index) => (
                    <li key={index}>
                      <a href={`#section${index}`}>
                        {index + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="glass mb-4" data-aos="fade-up">
                <h2>Welcome to Native91</h2>

                <p>
                  These Terms govern your use of our website, marketplace,
                  products and services. By accessing our platform you agree to
                  these Terms.
                </p>
              </div>

              {sections.map((item, index) => (
                <div
                  className="glass mb-4"
                  id={`section${index}`}
                  key={index}
                  data-aos="fade-up"
                >
                  <h3>
                    <i className={`bi ${item.icon}`}></i> {index + 1}.{" "}
                    {item.title}
                  </h3>

                  {item.content && <p>{item.content}</p>}

                  {item.list && (
                    <ul>
                      {item.list.map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              <div className="glass" data-aos="zoom-in">
                <h3>
                  <i className="bi bi-envelope"></i>
                  Contact Us
                </h3>

                <p>
                  <strong>Native91</strong>
                </p>

                <p>Email : support@native91.com</p>

                <p>Website : www.native91.com</p>

                <p>
                  Business Hours : Monday – Saturday 10:00 AM – 6:00 PM (IST)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Condition;
