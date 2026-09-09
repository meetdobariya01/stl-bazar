import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";
import "aos/dist/aos.css";
import "./shipping.css";

const sections = [
  {
    title: "Scope and Application",
    list: [
      "This Shipping, Delivery and Order Fulfilment Policy (“Shipping Policy”) sets out the terms and conditions governing the packing, processing, dispatch, transportation, tracking, and delivery of products purchased through the Native91 Platform. The purpose of this Policy is to establish a clear framework concerning the respective responsibilities of Native91, independent Sellers, Users, and logistics or shipping service providers involved in the fulfilment of Orders placed through the Platform.",

      "Native91 operates a curated marketplace through which products may be offered for sale by independent third-party Sellers. Accordingly, the physical preparation, packaging, and dispatch of a product shall ordinarily be undertaken by the relevant Seller, while transportation and delivery may be facilitated through Native91’s integrated logistics partners or other shipping providers approved or designated by Native91. The precise logistics arrangement applicable to an Order may depend upon the product, Seller, delivery location, availability of the relevant logistics service, and the operational structure adopted by Native91 from time to time.",

      "By placing an Order through the Platform, the User acknowledges that delivery timelines are subject to the handling time of the relevant Seller and the operational performance of the applicable logistics network. The User further acknowledges that an Estimated Delivery Date communicated through the Platform is an indicative estimate and not, unless expressly stated otherwise, an unconditional guarantee of delivery on a particular date.",

      "This Policy shall be read together with the Terms of Use/User Agreement, Seller Policy, Refund, Return and Cancellation Policy, Privacy Policy, and other applicable policies forming part of the Native91 marketplace framework. In the event of circumstances concerning cancellation, refund, return, exchange, non-delivery, damaged products, or other post-dispatch matters, the applicable provisions of the relevant policy shall also apply.",

      "Nothing contained in this Policy shall operate to exclude or restrict any mandatory right or remedy available to a User under applicable law. Where a statutory requirement imposes an obligation concerning delivery, consumer protection, product quality, refunds, or any related matter, such requirement shall continue to apply notwithstanding the contractual arrangements contained herein.",
    ],
  },

  {
    title: "Seller Handling, Preparation, Packing and Dispatch of Orders",
    list: [
      "Upon receipt and acceptance of an Order, the relevant Seller shall be responsible for preparing the product for dispatch in accordance with the applicable handling period stated on the relevant product page and the requirements of the Seller Policy. The Seller shall exercise reasonable care in preparing the product so that it is correctly identified, appropriately packed, and capable of being transported through the applicable logistics network without avoidable damage.",

      "Unless a different handling period is expressly stated on the relevant product page, Sellers shall ordinarily be required to dispatch Orders within the handling time specified for the product. As a general operating range, the handling period may be between one (1) and five (5) business days. The actual period may vary depending upon the nature of the product and whether the relevant item is a ready-made product or is manufactured, customised, prepared, assembled, or otherwise produced only after an Order has been received.",

      "A ready-made product may ordinarily be capable of being packed and handed over to the applicable logistics provider within a shorter period, whereas a made-to-order or otherwise specially prepared product may reasonably require additional processing time. The handling period displayed on the relevant product page shall therefore be treated as the principal indication of the Seller’s expected preparation period for that particular product.",

      "The Seller shall not deliberately or unreasonably delay the processing or dispatch of an accepted Order. The Seller shall ensure that the product corresponding to the Order is available for handover to the applicable logistics provider within the stated handling period, subject to circumstances beyond the Seller’s reasonable control.",

      "Where Native91 has integrated logistics arrangements with one or more logistics partners, the Seller shall use the logistics mechanism prescribed or made available by Native91 for the relevant Order. Where another shipping provider has been approved by Native91 for a particular category, Seller, location, or transaction, the Seller may use such approved provider in accordance with the applicable instructions.",

      "The Seller shall ensure that the product handed over for dispatch corresponds materially with the product purchased by the User, including the applicable product description, quantity, variant, size, colour, configuration, and other material characteristics represented at the time of purchase. The Seller shall also ensure that the product is packed in accordance with the applicable packaging requirements so that it is reasonably protected during handling, transportation, sorting, and delivery.",

      "Native91 may monitor dispatch performance for marketplace administration, customer experience, Seller compliance, and logistics management purposes. Where Seller repeatedly fails to meet its stated handling obligations, Native91 may take appropriate measures in accordance with the Seller Policy and other applicable terms.",

      "The dispatch of an Order by the Seller shall not, by itself, constitute confirmation that delivery will occur on a particular date. Once the product has been handed over to the applicable logistics provider, the delivery process shall also be subject to transportation conditions, network capacity, routing, weather, regional restrictions, and other circumstances affecting the logistics chain.",
    ],
  },

  {
    title: "Shipping Charges, Applicable Rates and Checkout Disclosure",
    list: [
      "Shipping charges, where applicable, shall be calculated and communicated to the User during the checkout process. The amount of such charges may depend upon a combination of factors, including the total value of the User’s cart, the delivery location, the applicable serviceability parameters, the nature or weight of the shipment where relevant, and the shipping rates applicable to the logistics partner responsible for transportation.",

      "The User shall be provided with the applicable shipping charge before payment is completed, subject to the technical functioning of the Platform and the applicable transaction process. Such shipping charges shall be added to the relevant Order value and shall form part of the amount payable by the User at checkout unless waived or otherwise adjusted pursuant to a promotional offer or other applicable provision.",

      "Native91 may revise shipping rates or the method of calculating shipping charges from time to time based upon changes in logistics costs, service areas, carrier rates, commercial arrangements, operational requirements, or other legitimate factors. The applicable charge for an Order shall ordinarily be the charge displayed to the User at the time the Order is placed, subject to correction of manifest errors and the applicable terms concerning cancellation of Orders.",

      "Native91 may, from time to time, introduce promotional campaigns under which shipping charges may be reduced, discounted, partially subsidised, or entirely waived. The availability and conditions of such promotional shipping benefits shall be communicated through the Platform or other authorised Native91 communication channels. Such offers may be subject to minimum cart values, specified delivery locations, specified products, limited periods, or other conditions expressly communicated as part of the relevant promotion.",

      "A User shall not be entitled to assume that a shipping waiver or discount applicable to one Order, product, location, or promotional period will automatically apply to a subsequent Order. Promotional benefits shall remain subject to the terms communicated at the time of the relevant offer.",

      "Unless otherwise expressly provided under the Refund, Return and Cancellation Policy or required under applicable law, shipping charges may not be refundable once an Order has been dispatched. Where an Order is cancelled, returned, undelivered, or otherwise not completed, the treatment of shipping charges shall be determined in accordance with the applicable provisions governing that particular circumstance.",

      "The User shall be responsible for reviewing the complete Order value displayed at checkout, including the product price, applicable taxes, shipping charges, and any other amounts expressly identified as payable, before submitting payment or confirming the Order.",
    ],
  },

  {
    title: "Delivery Estimates, Serviceability and Geographic Limitations",
    list: [
      "Native91 shall endeavour to provide the User with an Estimated Delivery Date at checkout based upon the delivery pin code supplied by the User and the expected operational timelines applicable to the relevant Seller and logistics network. The Estimated Delivery Date is intended to provide the User with a reasonable indication of when the Order may be delivered and shall not, unless expressly stated otherwise, constitute a guaranteed delivery date.",

      "Actual delivery may occur earlier or later than the Estimated Delivery Date. The delivery timeline may be affected by circumstances arising after an Order has been placed, including courier network conditions, transportation delays, weather conditions, regional restrictions, local disruptions, route availability, operational capacity, public holidays, regulatory requirements, natural events, or other logistical factors.",

      "The User acknowledges that Native91 may not exercise direct control over every stage of the transportation process once an Order has been handed over to an independent logistics provider. Native91 shall nevertheless use reasonable efforts, within the scope of its operational role, to facilitate completion of delivery and to provide appropriate tracking or status information where such information is made available by the logistics partner.",

      "Delivery serviceability shall be determined by reference to the pin code and other location information provided by the User. Native91 may limit delivery to locations that fall within the operational coverage of its available logistics partners. The list of Serviceable Pin Codes may change from time to time depending upon logistics capacity, business expansion, operational considerations, regulatory requirements, or other relevant circumstances.",

      "Where the pin code entered by a User is not serviceable at the relevant time, the Platform may indicate that delivery is unavailable for that location. In such circumstances, the User may be prevented from completing the Order for the relevant address through the Platform.",

      "The absence of serviceability for a particular pin code shall not necessarily indicate that the location will remain permanently outside Native91’s delivery network. Serviceability may be introduced, expanded, suspended, or modified from time to time.",

      "The User shall be responsible for entering a complete and accurate delivery address and pin code. An incorrect or incomplete address may result in delivery failure, additional delivery attempts, delay, return of the Order to the Seller, or other consequences in accordance with this Policy and the applicable refund and cancellation terms.",

      "Native91 may also impose reasonable restrictions concerning particular products or categories where transportation, storage, safety, regulatory, geographical, or other conditions make delivery to certain locations unsuitable or unavailable.",
    ],
  },

  {
    title: "Tracking of Orders and Delivery Attempts",
    list: [
      "Following dispatch of an Order, Native91 may make tracking information available to the User through the “My Orders” section of the User’s Account or through tracking details communicated by SMS, email, or another authorised communication mechanism.",

      "The availability and frequency of tracking updates may depend upon the information received from the applicable logistics provider and the technical systems used to record and communicate shipment status.",

      "Tracking information is intended to provide the User with visibility concerning the movement and status of the Order. The User acknowledges that tracking information may not update continuously or in real time and that temporary gaps, delays, or discrepancies in tracking information may occur due to operational or technical reasons.",

      "The applicable logistics partner will ordinarily make reasonable delivery attempts at the address provided by the User. As a general operational practice, up to three (3) delivery attempts may be made where an initial attempt does not result in successful delivery. The actual number and manner of delivery attempts may depend upon the policies and operational practices of the relevant logistics provider and the circumstances of the shipment.",

      "The User shall ensure that the delivery address, recipient information, and other details supplied at checkout are accurate and that reasonable arrangements are made for receipt of the Order. Where delivery cannot be completed due to circumstances attributable to the User, including an incorrect or incomplete address, inaccurate recipient information, unavailability of the recipient, refusal to accept the shipment without valid cause, failure to respond to delivery communications, or other similar circumstances, the logistics provider may make additional attempts in accordance with its operational procedures.",

      "Where delivery remains unsuccessful after the applicable delivery attempts, the Order may be returned to the relevant Seller. Such return-to-origin or return-to-Seller process may be subject to the operational procedures of the logistics provider.",

      "Where an Order is returned to the Seller due to circumstances attributable to the User, any refund otherwise payable to the User shall be processed in accordance with the applicable Refund, Return and Cancellation Policy. To the extent permitted by applicable law and the relevant policy, amounts attributable to shipping, handling, return transportation, or other applicable costs may be deducted from the amount otherwise refundable to the User.",

      "The User acknowledges that such deductions shall be subject to the applicable contractual terms and mandatory legal requirements and shall not operate to restrict any statutory consumer protection or other non-excludable legal right.",

      "Where delivery fails for reasons not attributable to the User, the matter shall be dealt with in accordance with the applicable delivery, refund, cancellation, and consumer protection provisions.",
    ],
  },

  {
    title:
      "Delivery Acceptance, Recipient Details and Responsibility for Delivery Information",
    list: [
      "The User shall be responsible for ensuring that all information required to facilitate delivery is complete and accurate at the time of checkout. Such information may include the recipient’s name, complete delivery address, pin code, mobile number, and any other information reasonably required by the logistics provider for successful delivery.",

      "Native91 and its logistics partners may rely upon the information supplied by the User and shall not ordinarily be responsible for independently verifying the relationship between the User placing an Order and the person identified as the recipient.",

      "A User may request that an Order be delivered to a person other than the User. Such arrangement may commonly arise where an Order is purchased as a gift or where the User wishes the product to be received by a family member, friend, colleague, business associate, or other intended recipient.",

      "Delivery to an alternate recipient shall be permitted subject to the relevant delivery location being within a Serviceable Pin Code and subject to any other restrictions applicable to the product or delivery service.",

      "Where an alternate recipient is identified at checkout, the User shall remain responsible for ensuring that the recipient’s name, address, contact details, and other information are correct. Native91 and its logistics partners shall not be responsible for determining whether the identified recipient is personally known to the User or whether the User has a particular relationship with that recipient.",

      "The User shall also be responsible for ensuring that the recipient is reasonably available to receive the Order and that the delivery address is capable of being accessed by the applicable logistics provider.",

      "Where the User provides incorrect information or designates an unintended recipient, the consequences may include delay, unsuccessful delivery, return of the Order, or other logistical consequences. Where such circumstances are attributable to the User, the relevant provisions concerning failed delivery and applicable deductions or refunds may apply.",

      "The User should therefore carefully verify all delivery details before finalising an Order. Native91 may provide functionality for modifying delivery details before dispatch where such functionality is technically available; however, modification of an address after dispatch may not be possible and shall remain subject to the operational capabilities of the logistics provider.",
    ],
  },

  {
    title:
      "Packaging Requirements and Seller Responsibility for Safe Transit",
    list: [
      "Every Seller participating on the Native91 Platform shall comply with the packaging requirements established under the applicable Seller Policy and shall ensure that products are packaged in a manner reasonably appropriate to their nature, fragility, composition, size, weight, and anticipated method of transportation.",

      "Packaging shall be sufficiently secure to protect the product against reasonably foreseeable risks associated with ordinary handling and transportation. The Seller shall take into account the characteristics of the product and shall adopt appropriate protective measures rather than applying an unsuitable uniform packaging method to all products.",

      "The required packaging standard may vary according to the product category. Fragile products such as handmade ceramics, glassware, or other breakable articles may require additional cushioning, protective layers, reinforced packaging, or other appropriate safeguards. Food products, including organic snacks and similar consumable products, may require food-grade, sealed, hygienic, and appropriately secure packaging consistent with applicable requirements.",

      "The Seller shall ensure that packaging is appropriate not only for preserving the physical condition of the product but also for complying with any mandatory legal, regulatory, health, safety, or labelling requirements applicable to the relevant product category.",

      "Where the product arrives damaged and the damage is reasonably attributable to inadequate, insufficient, defective, or inappropriate packaging by the Seller, the matter shall be treated as a Manufacturing Defect-equivalent issue for purposes of the Refund, Return and Cancellation Policy contained in Chapter 4, subject to the applicable investigation and evidentiary requirements.",

      "For avoidance of doubt, the classification of packaging-related damage as a Manufacturing Defect-equivalent issue shall not necessarily mean that every instance of transit damage is attributable to the Seller. The circumstances surrounding the damage may be reviewed to determine whether the damage resulted from inadequate packaging, mishandling during transit, an inherent defect in the product, or another cause.",

      "The Seller shall cooperate with reasonable requests for photographs, packaging information, product condition evidence, dispatch records, or other information required to assess a damage-related complaint.",

      "Native91 may establish additional packaging standards, particularly for categories involving fragile, perishable, liquid, food, cosmetic, or otherwise sensitive products. Sellers shall comply with such requirements as applicable to their listings.",

      "Repeated instances of inadequate packaging may result in compliance review or other measures under the Seller Policy, particularly where the pattern of conduct adversely affects Users or the integrity of the marketplace.",
    ],
  },

  {
    title: "Risk, Delivery and Circumstances Affecting Transportation",
    list: [
      "Subject to applicable law and the specific contractual terms governing a transaction, risk in the product shall pass to the User upon delivery of the product to the delivery address provided by the User at checkout.",

      "For purposes of this provision, delivery shall be understood by reference to the applicable delivery process and the circumstances in which the shipment is handed over at the designated address or otherwise accepted through the authorised delivery procedure.",

      "The User shall therefore remain responsible for ensuring that the delivery address is accurate and capable of receiving the shipment. Where an Order is directed to an alternate recipient or location at the User’s request, the User shall remain responsible for the accuracy of the information supplied for that purpose.",

      "The transfer of risk upon delivery shall not affect any statutory consumer right, warranty, refund right, return right, or remedy that cannot lawfully be excluded. In particular, a User shall retain any applicable remedy concerning products that are defective, damaged due to inadequate packaging, materially different from their description, or otherwise subject to rights under applicable law or the relevant Native91 policy.",

      "Delivery and transportation may be affected by events that are outside the reasonable control of Native91 or its logistics partners. Such circumstances may include natural disasters, pandemics, strikes, riots, war, governmental or regulatory restrictions, road or transportation disruptions, telecommunications or technology failures, courier network interruptions, severe weather, regional restrictions, or other circumstances materially affecting the ordinary functioning of the logistics network.",

      "Where delivery is delayed due to such circumstances, the delay shall not, by itself, constitute a breach of this Policy by Native91 or the applicable logistics partner, provided that reasonable efforts are undertaken within the scope of their operational control to resume or complete delivery once the relevant circumstances permit.",

      "Native91 shall endeavour to communicate material delivery disruptions to Users where reasonably practicable. However, the User acknowledges that the precise duration and effect of an external disruption may not always be capable of being predicted.",

      "Where an external event materially affects an Order, the User may be required to await restoration of the relevant logistics service or may become eligible for cancellation, refund, or other relief in accordance with the applicable policies and mandatory law.",

      "Nothing contained herein shall be construed as granting Native91 or a Seller immunity from obligations that cannot lawfully be excluded in respect of consumer protection, product defects, fraud, wilful misconduct, or other matters for which liability is imposed by mandatory law.",
    ],
  },

  {
    title: "Expansion of Serviceable Locations and Phased Delivery Network",
    list: [
      "Native91 intends to expand its delivery network progressively in accordance with its phased marketplace rollout and operational capabilities. The initial phase of operations is contemplated to focus on Ahmedabad, followed by expansion across major cities in Gujarat, and subsequently by a broader pan-India delivery network. International expansion may be considered thereafter, subject to applicable commercial, regulatory, logistical, and operational requirements.",

      "The foregoing rollout structure is indicative of Native91’s planned expansion and shall not be construed as an unconditional guarantee that delivery will become available in every location by a particular date. The availability of delivery services shall depend upon Native91’s operational readiness, logistics partnerships, applicable regulatory requirements, infrastructure, serviceability, and other relevant considerations.",

      "As the delivery network expands, the list of Serviceable Pin Codes may be increased. A location that is not serviceable at the time a User attempts to place an Order may subsequently become serviceable following expansion or modification of Native91’s logistics network.",

      "Users located in areas that are not yet serviceable may be permitted to register their interest through an appropriate facility made available by Native91. Where such functionality is provided, the User may submit the relevant location information for the purpose of receiving notification when delivery services become available.",

      "Registration of interest shall not constitute an Order, reservation, commitment to provide delivery, or guarantee of a particular launch date. It merely enables Native91 to understand demand and, where appropriate, notify interested Users regarding future availability.",

      "Native91 may determine the order, timing, and geographical scope of its expansion based upon commercial considerations, logistics capacity, infrastructure, regulatory requirements, demand, and other operational factors.",
    ],
  },

  {
    title:
      "Failed Delivery, Misuse of Delivery Facilities and Restriction of Privileges",
    list: [
      "The User is expected to make reasonable arrangements to receive Orders placed through the Platform. Persistent failure to receive Orders, repeated unavailability at the delivery address, provision of false or materially inaccurate addresses, deliberate refusal of COD Orders without valid cause, or other conduct that repeatedly results in unsuccessful delivery may adversely affect the availability of certain delivery-related privileges.",

      "Where Native91 reasonably identifies a persistent pattern of delivery misuse, it may restrict, suspend, or withdraw the User’s access to COD facilities or certain shipping services. Such action may be taken as a measure to protect Native91, Sellers, logistics partners, and the efficient functioning of the marketplace.",

      "A single unsuccessful delivery shall not necessarily constitute misuse. Circumstances may arise in which a User is genuinely unable to receive a shipment or an address requires correction. The purpose of the restriction mechanism is to address persistent or unreasonable patterns rather than ordinary and isolated delivery difficulties.",

      "In assessing whether a restriction is appropriate, Native91 may consider factors including the frequency of failed deliveries, the reasons for non-acceptance, the accuracy of the information supplied, the User’s transaction history, repeated COD refusals, and other circumstances relevant to the integrity of the delivery system.",

      "Where a User provides a false address or deliberately supplies information intended to prevent successful delivery, Native91 may take appropriate action without prejudice to any other contractual or legal rights available to it.",

      "Similarly, where COD is repeatedly accepted as a payment option and then deliberately refused without valid cause, Native91 may determine that continued availability of COD to that User presents an unreasonable operational risk and may restrict the facility.",

      "Any restriction imposed under this clause shall be without prejudice to Native91’s other rights and remedies under the Terms of Use, this Policy, the Refund, Return and Cancellation Policy, Seller Policy, or applicable law.",

      "Restriction of a particular privilege shall not necessarily result in termination of the User’s Account. Native91 may, depending upon the circumstances, continue to permit prepaid Orders or other Platform functions while restricting the specific service that has been repeatedly misused.",
    ],
  },

  {
    title: "Responsibilities of Users in Relation to Delivery",
    list: [
      "Users shall provide complete, accurate, and current information necessary for delivery and shall exercise reasonable care in reviewing such information before placing an Order. The User shall be responsible for ensuring that the delivery address corresponds to the intended destination and falls within the applicable serviceable area.",

      "The User should remain reasonably available to receive an Order or should make suitable arrangements for an authorised recipient to receive the shipment where permitted. Where delivery communications are sent by the logistics partner, the User should respond where necessary to facilitate successful delivery.",

      "The User shall not intentionally obstruct or frustrate the delivery process. Where an Order is placed through COD, the User shall accept the shipment and make the applicable payment where the Order is legitimate and corresponds with the Order placed, subject to any lawful right of refusal or other remedy available under applicable law.",

      "The User should also review the status of an Order through the “My Orders” section or other tracking facility where available. Where an Order appears to be materially delayed, incorrectly marked as delivered, or otherwise affected by an apparent logistics issue, the User should contact Native91 customer support through the available support mechanism within a reasonable period.",

      "Where an Order is delivered to an alternate recipient at the User’s request, the User shall remain responsible for communicating appropriate information to that recipient so that the recipient is reasonably prepared to receive the shipment.",

      "Nothing in this clause shall impose responsibility upon a User for circumstances genuinely outside the User’s control. Legitimate delivery difficulties, unforeseen emergencies, or other reasonable circumstances shall be assessed in accordance with the applicable facts and policies.",
    ],
  },

  {
    title: " Responsibilities of Sellers and Logistics Providers",
    list: [
      "Sellers are responsible for complying with the applicable handling and packaging requirements and for ensuring timely handover of Orders to the designated or approved logistics provider.",

      "The Seller shall ensure that products are properly identified, packed, labelled where legally required, and accompanied by the information necessary for lawful and efficient shipment. The Seller shall not knowingly tender an incorrect, defective, prohibited, or non-compliant product for dispatch.",

      "Once the product has been handed over to a logistics provider, transportation and delivery shall be performed in accordance with the operational processes applicable to that provider.",

      "Native91 may coordinate with its logistics partners to facilitate shipment tracking, delivery attempts, and resolution of logistics-related issues.",

      "Logistics providers may determine routing, delivery schedules, delivery attempts, and other operational matters in accordance with their procedures, subject to the contractual and legal framework applicable to the relevant shipment.",

      "Native91 may liaise with Sellers and logistics partners where an Order is delayed, damaged, returned, or otherwise affected during transportation. The precise responsibility for an issue may depend upon the circumstances giving rise to it, including whether the issue arose from packaging, product condition, incorrect address information, transportation handling, external disruption, or another cause.",

      "Where a dispute arises concerning damage, loss, non-delivery, or another logistics event, Native91 may request reasonable supporting information from the User, Seller, or logistics provider for purposes of determining the appropriate course of action.",
    ],
  },

  {
    title: "Delays and Reasonable Delivery Efforts",
    list: [
      "The User acknowledges that the Estimated Delivery Date displayed by Native91 is based upon information available at the time of calculation and may change due to circumstances arising subsequently.",

      "Native91 shall use reasonable efforts, within the scope of its role and operational control, to facilitate timely delivery. However, Native91 cannot guarantee that every Order will arrive within the initially estimated period where delivery is affected by circumstances outside its reasonable control.",

      "Such circumstances may include courier capacity constraints, transportation disruptions, weather conditions, regional restrictions, public disturbances, regulatory measures, natural disasters, strikes, pandemics, technical failures, or interruptions affecting logistics infrastructure.",

      "A delay caused by such circumstances shall not automatically constitute a breach of this Policy. Native91’s responsibility in such circumstances shall be limited to taking reasonable steps to facilitate completion of delivery once the relevant disruption has ceased or sufficiently subsided.",

      "Where a delay becomes material or where the Order can no longer reasonably be fulfilled, the User’s rights shall be determined in accordance with the applicable cancellation, refund, consumer protection, and other legal provisions.",

      "Native91 may provide revised delivery information where reliable information becomes available. Users are encouraged to monitor the tracking information associated with their Orders and to contact customer support where an Order remains materially delayed beyond the indicated delivery period.",
    ],
  },

  {
    title: "Return of Undelivered Orders and Applicable Refunds",
    list: [
      "Where delivery cannot be completed after the applicable delivery attempts, the logistics provider may initiate a return of the shipment to the relevant Seller. Such return may arise from circumstances attributable to the User, including an incorrect address, incomplete address, recipient unavailability, refusal to accept the Order without valid cause, or other circumstances preventing successful delivery.",

      "Where the shipment is returned to the Seller, any refund due to the User shall be processed in accordance with the Refund, Return and Cancellation Policy and subject to applicable law.",

      "Where the failed delivery is attributable to the User and the applicable policy permits deduction of reasonable shipping, handling, return transportation, or other charges, such amounts may be deducted from the refundable amount to the extent legally permissible.",

      "Where the failure to deliver is attributable to Native91, the Seller, or the logistics provider, the applicable refund or other remedy shall be determined in accordance with the relevant policy and mandatory consumer protection requirements.",

      "The User shall not be deemed to have voluntarily cancelled an Order merely because delivery was unsuccessful unless the circumstances and applicable policy establish such cancellation. The classification of the transaction shall depend upon the reason for the failed delivery and the applicable contractual and legal framework.",
    ],
  },

  {
    title: "Compliance With Applicable Law and Preservation of User Rights",
    list: [
      "All shipping and delivery activities conducted through the Platform shall be subject to applicable laws, regulations, regulatory directions, consumer protection requirements, product-specific transportation restrictions, and other mandatory legal requirements.",

      "Nothing in this Policy shall be construed as limiting a User’s statutory rights concerning defective, damaged, deficient, unsafe, misdescribed, or otherwise non-conforming products.",

      "Where a product arrives damaged due to inadequate Seller packaging, the matter may be treated as a Manufacturing Defect-equivalent issue in accordance with the applicable Refund, Return and Cancellation Policy. Where the damage arises from another cause, the applicable facts and policy provisions shall determine the appropriate remedy.",

      "Similarly, the transfer of risk upon delivery shall not deprive a User of any statutory remedy concerning defects or other circumstances for which liability remains imposed by applicable law.",

      "Native91 may modify operational procedures relating to shipping, delivery, serviceability, tracking, packaging, or logistics where such modification is reasonably necessary to comply with changes in law, regulatory requirements, business operations, logistics arrangements, or Platform functionality.",

      "Users and Sellers shall remain responsible for complying with the requirements applicable to their respective roles.",
    ],
  },

  {
    title: "Policy Administration and General Provisions",
    list: [
      "Native91 may periodically review and update its shipping and delivery procedures to reflect changes in logistics arrangements, serviceable locations, carrier partnerships, operational capabilities, technology, regulatory requirements, or marketplace practices.",

      "Any material amendment to this Policy shall be communicated and implemented in accordance with the applicable amendment provisions contained in the Terms of Use or other governing policy.",

      "Native91 may engage, replace, or modify its logistics partners and may adopt different shipping providers for particular locations, products, categories, or stages of its operational expansion. Such changes may affect delivery estimates, tracking mechanisms, available services, or applicable shipping charges, and the User shall be bound by the arrangements applicable to the Order at the relevant time, subject to applicable law.",

      "If any provision of this Policy is determined by a court or competent authority to be invalid, unlawful, or unenforceable, such determination shall not affect the remaining provisions. The affected provision shall, to the maximum extent legally permissible, be interpreted or enforced in a manner that gives effect to its lawful purpose, and the remaining provisions shall continue in full force and effect.",

      "This Policy shall be read as an integral part of the Native91 Buyer Policy and shall operate together with the Terms of Use/User Agreement, Refund, Return and Cancellation Policy, Seller Policy, Privacy Policy, and other applicable Platform terms.",

      "No provision of this Policy shall be interpreted in isolation where another applicable policy governs the same transaction or circumstance.",

      "By placing an Order through the Platform, the User acknowledges the operational nature of the delivery process, including Seller handling requirements, shipping charges, indicative delivery estimates, serviceability restrictions, tracking mechanisms, delivery attempts, alternate recipient arrangements, packaging standards, and circumstances beyond Native91’s reasonable control.",

      "The User further acknowledges that the successful completion of delivery depends upon cooperation among the User, Seller, Native91, and the relevant logistics provider. Each participant is expected to perform the responsibilities applicable to them so as to facilitate efficient and reliable fulfilment of Orders.",

      "Native91 shall use reasonable efforts to maintain an effective delivery network and to expand serviceability in accordance with its phased rollout. However, the availability, timing, and scope of delivery services may vary depending upon operational, logistical, commercial, regulatory, and external circumstances.",

      "Subject to applicable law and the rights expressly preserved under the applicable policies, this Shipping, Delivery and Order Fulfilment Policy shall govern the shipping and delivery arrangements applicable to Orders placed through the Native91 Platform.",
    ],
  },

  {
    title: "Payment Processing Through Razorpay",
    list: [
      "Where a User makes payment for an Order through Razorpay or any payment gateway integrated with the Native91 Platform, the payment transaction may be processed, authenticated, routed or otherwise facilitated by Razorpay, the relevant bank, card network, UPI service provider or other financial intermediary. An Order shall ordinarily be processed for fulfilment only after Native91 receives appropriate confirmation of successful payment through the applicable payment gateway or financial institution.",

      "In the event that a payment is unsuccessful, declined, reversed, pending or otherwise not confirmed, Native91 may be unable to process or dispatch the corresponding Order until valid payment confirmation is received. Native91 shall not be responsible for delays arising solely from payment authentication, transaction processing, banking systems, Razorpay, card networks, UPI service providers or other third-party financial intermediaries.",

      "Razorpay’s role is limited to payment processing and related transaction facilitation. Razorpay does not control the preparation, packaging, dispatch, transportation or delivery of Products purchased through Native91. Accordingly, delivery timelines shall be determined in accordance with the applicable Seller, logistics provider, delivery location and other provisions of this Shipping and Delivery Policy.",

      "Where a payment has been successfully processed but the Order cannot subsequently be fulfilled, any applicable cancellation or refund shall be handled in accordance with Native91’s Refund, Return, Exchange and Cancellation Policy and applicable law. The use of Razorpay or any other payment gateway shall not limit or affect any statutory right or remedy available to the User.",
    ],
  },
];
const Shipping = () => {
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
      setProgress((window.scrollY / total) * 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      {/* Header */}
      <Header />

      <div className="shipping-page lexend">
        <div
          className="progress-bar-top"
          style={{ width: `${progress}%` }}
        ></div>

        <section className="shipping-hero">
          <div className="container text-center">
            <span className="badge bg-light text-success mb-3">
              Shipping Policy
            </span>

            <h1 data-aos="fade-down">Safe & Reliable Shipping</h1>

            <p data-aos="fade-up">Last Updated : September 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3 mb-4">
              <div className="policy-menu sticky-top">
                <h5>Contents</h5>

                <ul>
                  {sections.map((item, i) => (
                    <li key={i}>
                      <a href={`#section${i}`}>
                        {i + 1}. {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="col-lg-9">
              <div className="policy-card mb-4" data-aos="fade-up">
                <h2>Welcome to Native91</h2>

                <p>
                  We are committed to delivering your orders safely, securely,
                  and on time. Please read our Shipping Policy carefully to
                  understand how we process and deliver your orders.
                </p>
              </div>

              {sections.map((item, i) => (
                <div
                  className="policy-card mb-4"
                  id={`section${i}`}
                  key={i}
                  data-aos="fade-up"
                >
                  <h3>
                    <i className={`bi ${item.icon}`}></i>
                    {i + 1}. {item.title}
                  </h3>

                  {item.content && <p>{item.content}</p>}

                  {item.list && (
                    <ul>
                      {item.list.map((x, index) => (
                        <li key={index}>{x}</li>
                      ))}
                    </ul>
                  )}

                  {item.table && (
                    <div className="table-responsive mt-3">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>Location</th>
                            <th>Estimated Delivery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.table.map((row, index) => (
                            <tr key={index}>
                              <td>{row[0]}</td>
                              <td>{row[1]}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {item.note && (
                    <div className="alert alert-warning mt-3">{item.note}</div>
                  )}
                </div>
              ))}

              <div className="policy-card" data-aos="zoom-in">
                <h3>
                  <i className="bi bi-envelope-paper"></i>
                  Contact Us
                </h3>

                <p>
                  If you have any questions regarding shipping, please contact
                  us.
                </p>

                <p>
                  <strong>Email:</strong>
                  <br />
                  support@native91.com
                </p>

                <p>
                  <strong>Business Hours:</strong>
                  <br />
                  Monday – Saturday
                  <br />
                  10:00 AM – 6:00 PM (IST)
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

export default Shipping;
