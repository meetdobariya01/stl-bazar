import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import AOS from "aos";
import "./return.css";
import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";

const sections = [
  {
    title: "Purpose, Scope And Applicability",
    list: [
      "This Refund, Return, Exchange and Cancellation Policy (“Refund Policy” or “Policy”) governs the circumstances, procedure and conditions under which a User may seek cancellation of an Order, return or exchange of Products, or a refund of amounts paid in connection with an Order placed through the Native91 Platform. Native91 operates as a curated online marketplace through which Users may discover and purchase Products offered by independent Sellers. Accordingly, the eligibility of a particular Product for cancellation, exchange or refund may depend upon the nature of the Product, the stage of fulfilment, the reason for the request, the applicable Seller terms, and the rights available to the User under applicable law.",

      "The purpose of this Policy is to establish a transparent and commercially reasonable framework for addressing cancellations, defective Products, damaged Products, incorrect Products, materially different Products and other circumstances in which a refund or exchange may appropriately arise. At the same time, this Policy is not intended to restrict, waive, contract out of, or otherwise prejudice any mandatory right or remedy available to a User under applicable Indian law. Where a provision of this Policy is inconsistent with a mandatory statutory protection applicable to the transaction, the statutory protection shall prevail to the extent of such inconsistency.",

      "Native91 recognises that Products available on the Platform may include handmade articles, artisan-produced goods, personalised Products, customised Products, small-batch Products, food and other Products which may possess characteristics that distinguish one unit from another. Consequently, the availability of a general “change-of-mind” return may differ from the remedies available in cases involving defects, damage, incorrect fulfilment, safety concerns or material deviation from the Product description. The specific Product page, Order information, applicable Seller terms and this Policy should therefore be read together when determining the remedies available in relation to a particular Order.",

      "Nothing contained herein shall be construed as limiting the right of a User to approach Native91’s grievance mechanism, the appropriate consumer authority, Consumer Disputes Redressal Commission, National Consumer Helpline or any other competent authority or forum having jurisdiction over the dispute, subject always to applicable law.",
    ],
  },

  {
    title:
      "Statutory Consumer Rights And Non-Exclusion Of Mandatory Remedies",
    list: [
      "Notwithstanding anything contained elsewhere in this Policy, a User shall retain all mandatory statutory rights available under the Consumer Protection Act, 2019 and other applicable laws. Native91 shall not interpret or apply any contractual provision in a manner that unlawfully excludes or diminishes a right or remedy which cannot legally be waived by a consumer.",

      "A User is entitled to receive a Product that substantially corresponds with the description, specifications, representations and material characteristics communicated on the Platform and is reasonably fit for the ordinary purpose for which such Product is sold, subject to the nature and inherent characteristics of the particular Product. Where a Product is represented as possessing particular qualities, dimensions, materials, ingredients, features or other material characteristics, such representations shall be assessed in accordance with the information made available to the User at the time of purchase and the nature of the Product concerned.",

      "Where a Product delivered to a User is defective, unsafe, materially different from the Product ordered, incorrectly supplied, or otherwise fails to conform to the applicable description or representations in a manner giving rise to a statutory remedy, the User may be entitled to an appropriate remedy, which may include replacement, repair, exchange or refund, depending upon the circumstances of the case, the nature of the defect or non-conformity, the availability of the Product, and applicable law.",

      "The availability of a particular remedy shall not be determined solely by the commercial preference of Native91 or the Seller where applicable law mandates a different remedy. Native91 may, however, request reasonable information, photographs, videos, invoices, packaging details or other evidence necessary to establish the nature and circumstances of the complaint and to coordinate with the relevant Seller or logistics provider.",

      "A User may initially raise a complaint through Native91’s internal grievance and customer-support mechanisms. Such internal process is intended to facilitate efficient resolution and shall not prevent a User from exercising any independent statutory right to seek redressal before an appropriate consumer forum, authority or other competent body.",
    ],
  },

  {
    title: "Nature Of Returns And Change-Of-Mind Requests",
    list: [
      "Native91 follows a restricted return framework in view of the distinctive nature of several Products offered through the Platform. A substantial proportion of Products may be handmade, artisan-created, personalised, customised, made-to-order or manufactured in limited batches. Unlike standard mass-produced Products, such Products may involve individual craftsmanship, specific raw materials, production time, custom measurements, personalisation instructions or limited inventory. Permitting unrestricted returns solely because a User subsequently changes their preference could consequently result in substantial commercial and operational difficulties for Sellers.",

      "Accordingly, unless the relevant Product page expressly states otherwise, Native91 does not ordinarily accept a return merely because a User has changed their mind after delivery, no longer wishes to retain the Product, selected a different preference, or subsequently decided that the Product is not suitable for their personal preference where the Product itself is otherwise compliant with the Order and free from a qualifying defect or material discrepancy.",

      "The applicable return or non-return position shall be disclosed on the relevant Product page or through the purchasing interface before the User completes the transaction, wherever such disclosure is required. Users are therefore expected to review the Product description, dimensions, specifications, material information, colour or design details, customisation requirements, care instructions and applicable return conditions before placing an Order.",

      "A change-of-mind restriction shall not operate as a waiver of statutory consumer rights. In particular, the exclusion of discretionary returns does not prevent a User from seeking an appropriate remedy where the Product is defective, damaged, unsafe, materially different from the description, incorrectly supplied or otherwise falls within circumstances for which a remedy is legally available.",
    ],
  },

  {
    title:
      "Eligibility For Exchange, Replacement Or Refund In Case Of Defective, Damaged Or Incorrect Products",
    list: [
      "Where a User receives a Product that is defective, damaged in transit, materially different from the Product ordered, incorrectly supplied, or otherwise affected by a qualifying fulfilment or manufacturing issue, the User may raise an exchange, replacement or refund request in accordance with this Policy and applicable law.",

      "For purposes of this Policy, a qualifying issue may include circumstances where the Product received is materially different from the description or specifications presented to the User, where an incorrect Product, variant, size, quantity or item has been supplied, where the Product has suffered material physical damage before or during delivery, or where a genuine manufacturing or functional defect substantially affects the Product’s ordinary use.",

      "Minor variations that are reasonably inherent in handmade, artisan or natural Products shall not automatically constitute a defect or non-conformity. For example, variations in colour, texture, grain, pattern, shape or finish may occur naturally in Products manufactured by hand or using natural materials. Such variations shall be assessed against the Product description and any representations made to the User at the time of purchase.",

      "Where, however, the difference is substantial and materially inconsistent with the Product description or the Order placed by the User, Native91 may treat the matter as a qualifying complaint and coordinate with the Seller to determine the appropriate remedy.",

      "Depending upon the circumstances, the remedy may consist of replacement or exchange of the affected Product, correction or repair where reasonably possible, or refund of the applicable amount where replacement or repair is unavailable, impracticable or otherwise appropriate under applicable law. The determination shall take into account the nature of the complaint, availability of replacement inventory, the characteristics of the Product and the rights available to the User.",
    ],
  },

  {
    title: "Damage During Transportation And Packaging-Related Issues",
    list: [
      "Where a Product arrives visibly damaged, broken, crushed, leaking, substantially deformed or otherwise compromised during transportation, the User should report the issue to Native91 as soon as reasonably practicable after delivery. Users are encouraged to preserve the original outer packaging, internal packaging, labels, shipping materials and other relevant materials until the complaint has been reviewed.",

      "Packaging may be particularly important in determining whether damage occurred during transportation or resulted from inadequate protection of the Product before dispatch. Sellers are required to comply with applicable Native91 packaging standards and to use packaging reasonably appropriate to the nature and fragility of the Product.",

      "For fragile Products such as ceramics, glassware, handcrafted articles and similar Products, appropriate protective material and cushioning should be used. Products requiring sealed, hygienic or food-grade packaging must be packaged in accordance with the applicable requirements relevant to the category.",

      "Where the available evidence indicates that a Product was materially damaged because of inadequate packaging or improper preparation for dispatch, Native91 may treat the matter as equivalent to a qualifying defect for the purposes of determining the User’s remedy under this Policy. This classification shall not prevent Native91 from separately pursuing an appropriate claim or recovery against the Seller or logistics partner where circumstances so warrant.",
    ],
  },

  {
    title: "Cancellation Of Orders Before Dispatch",
    list: [
      "A User may request cancellation of an Order at any time before the relevant Seller has dispatched the Product. Where the cancellation request is received before dispatch and the Order remains capable of being cancelled operationally, Native91 shall ordinarily process the cancellation without imposing a cancellation charge on the User, subject to applicable law and the circumstances of the Order.",

      "Native91 recognises that certain Products may require immediate commencement of production, preparation, personalisation or procurement after an Order is placed. In relation to time-sensitive, personalised, customised or made-to-order Products, Native91 may therefore provide only a limited cancellation window. As a general operational practice, reasonable efforts may be made to accommodate cancellation requests received within approximately two (2) hours of Order placement, including in circumstances where production may already have commenced; however, cancellation within such period cannot be guaranteed in every case.",

      "Once production, personalisation, procurement or fulfilment activities have progressed beyond a stage at which cancellation can reasonably be reversed, Native91 may be unable to cancel the Order without affecting the Seller’s legitimate costs and obligations. The applicable cancellation status may therefore depend upon the actual stage of fulfilment at the time the request is received.",

      "A cancellation request should be submitted as soon as the User decides not to proceed with the Order. Delay in raising the request may reduce the possibility of successful cancellation, particularly where the Product is made-to-order or has already entered the dispatch process.",
    ],
  },

  {
    title: "Cancellation After Dispatch And Orders In Transit",
    list: [
      "After a Product has been dispatched, cancellation may become operationally impracticable because the Product has entered the logistics network and may already be in transit between the Seller, fulfilment facility and delivery location. Native91 does not represent that a dispatched Order can always be recalled or intercepted.",

      "However, the fact that an Order has been dispatched shall not, by itself, be construed as extinguishing or restricting any statutory consumer remedy that may become applicable after delivery. The appropriate remedy in such circumstances shall depend upon the reason for the User’s request and whether the Product falls within the exchange, replacement, refund or other remedial circumstances recognised under this Policy or applicable law.",

      "Accordingly, a dispatched Order should not be described as being absolutely or legally “non-cancellable” in circumstances where applicable law may provide an independent remedy. The practical position is that cancellation during transit may not be operationally feasible, while any qualifying post-delivery complaint may still be raised through the applicable exchange, replacement, refund or grievance process.",

      "Where a User refuses delivery solely because they have changed their mind, Native91 may treat the matter as a failed delivery rather than as an approved return or cancellation, particularly where the Product was otherwise correctly supplied and no qualifying defect or discrepancy exists. Any resulting refund, if applicable, shall be determined in accordance with this Policy, the circumstances of the Order and applicable law.",
    ],
  },

  {
    title: " Cancellation By Seller Or Native91",
    list: [
      "An Order may, in appropriate circumstances, be cancelled by the Seller or Native91 before delivery. Such cancellation may arise where the Product is unavailable, the Seller is unable to fulfil the Order, a material pricing or listing error is identified, the delivery address is outside the applicable serviceable area, a Product becomes unavailable due to circumstances beyond reasonable control, or there are reasonable grounds to suspect fraudulent, abusive or otherwise improper activity associated with the transaction.",

      "Native91 may also cancel an Order where fulfilment would result in a violation of applicable law, regulatory requirements, safety standards or Platform rules, or where the Seller’s ability to lawfully supply the Product becomes doubtful or has been suspended.",

      "Where Native91 or the Seller cancels an Order for a reason attributable to non-availability, inability to fulfil, an identified listing or pricing error, or another circumstance for which the User is not responsible, Native91 shall ordinarily initiate an appropriate refund of amounts actually received for the cancelled Product, subject to the applicable payment process.",

      "Cancellation by Native91 or a Seller shall not be used as a mechanism to deprive a User of a statutory remedy. Where a cancellation arises after payment has been received, the refund process shall be handled in accordance with the applicable provisions of this Policy.",
    ],
  },

  {
    title:
      " Procedure For Raising A Refund, Exchange Or Cancellation Request",
    list: [
      "A User seeking cancellation, exchange, replacement or refund should raise the request through the “My Orders” section associated with the User’s Account wherever such functionality is available. A User may alternatively contact Native91’s customer-support team or the designated Grievance Officer through the communication channels made available on the Platform.",

      "The User should provide sufficient information to enable Native91 and the relevant Seller to identify and evaluate the Order. The Order number should ordinarily be quoted with every request. The User should also state the reason for the request clearly and provide such supporting information as may reasonably be required.",

      "For claims involving damage, defect, incorrect Products or material discrepancies, Users are strongly encouraged to provide clear photographs and, where useful, video evidence showing the Product, its condition, relevant labels, packaging and the nature of the alleged issue. Evidence should preferably be captured promptly upon receipt and before the Product is used, altered, washed, consumed, assembled, repaired or otherwise modified, except where immediate use is reasonably necessary or where the issue itself becomes apparent only through ordinary use.",

      "Where appropriate, the User should retain the original packaging until the complaint has been reviewed. Packaging evidence may assist Native91, the Seller and the logistics partner in determining whether damage occurred before dispatch, during transportation or after delivery.",

      "The submission of photographs, videos or other evidence is intended to facilitate verification and shall not be interpreted as imposing an unlawful evidentiary burden on the User or as excluding any remedy otherwise available under applicable law.",
    ],
  },

  {
    title: "Verification And Assessment Of Claims",
    list: [
      "Upon receiving a refund, exchange or replacement request, Native91 may conduct a reasonable review of the circumstances. Such review may involve examination of the Product information, Order details, photographs or videos supplied by the User, dispatch records, delivery records, Seller information, logistics records and other relevant information.",

      "Where necessary, Native91 may communicate with the relevant Seller or logistics partner to determine whether the complaint appears to involve a manufacturing issue, packaging deficiency, transportation damage, incorrect fulfilment or another circumstance.",

      "In appropriate cases, the User may be requested to make the Product available for inspection, pickup or return so that the complaint can be verified. Where a return pickup is arranged, the User should ensure that the Product is reasonably packed and made available in accordance with the instructions communicated by Native91.",

      "The existence of a verification process does not prevent Native91 from taking interim steps where the circumstances reasonably indicate that a Product is defective, unsafe, damaged or materially incorrect. Where immediate action is required due to a potential safety concern, Native91 may take appropriate steps in accordance with applicable law and the nature of the Product.",

      "Native91 shall endeavour to assess requests fairly and consistently, taking into account both the User’s complaint and the Seller’s obligations under the applicable Seller Policy.",
    ],
  },

  {
    title: "Exchange And Replacement Process",
    list: [
      "Where an exchange or replacement is approved, Native91 may arrange for the original Product to be collected and a replacement Product to be dispatched, subject to availability and the operational feasibility of such replacement.",

      "A replacement shall ordinarily correspond to the Product originally ordered, including the relevant variant, size, specification or other material characteristics, subject to availability. Where the identical Product is no longer available, Native91 may provide another legally and commercially appropriate remedy, including a refund where warranted.",

      "For handmade or small-batch Products, a replacement unit may not be perfectly identical in every visual or natural characteristic to the original unit. Reasonable variations inherent to the Product category shall not by themselves invalidate an otherwise appropriate replacement.",

      "Where a User has received an incorrect Product due to a fulfilment error, Native91 may arrange collection of the incorrectly supplied Product and dispatch of the correct Product, subject to availability. Where the correct Product cannot be supplied, the User may be eligible for a refund or another appropriate remedy.",
    ],
  },

  {
    title: " Return Of Products Approved For Exchange Or Refund",
    list: [
      "Where Native91 determines that a Product must be returned as part of an approved exchange, replacement or refund process, the User shall be informed of the applicable return procedure. The Product should ordinarily be returned in substantially the condition in which it was received, together with accessories, tags, labels, documentation and original packaging where reasonably available.",

      "A User should not intentionally damage, alter, misuse or materially change a Product after discovering a defect or discrepancy. Such conduct may affect the assessment of the claim to the extent permitted by law. Ordinary examination of a Product for the purpose of determining whether it corresponds with the Order shall not by itself constitute misuse.",

      "Where the nature of the complaint requires the Product to be returned, Native91 may coordinate a pickup through an approved logistics provider. If pickup is unavailable in a particular location, the User may be provided with alternative return instructions.",

      "The return of a Product does not automatically constitute approval of a refund. The final remedy shall remain subject to verification of the circumstances and the applicable provisions of this Policy and law.",
    ],
  },

  {
    title: "Refund Eligibility And Determination",
    list: [
      "A refund may be issued where an Order is validly cancelled before dispatch, where Native91 or the Seller cancels an Order after payment has been received, where an approved defective, damaged, incorrect or materially non-conforming Product cannot reasonably be replaced or exchanged, or where a refund is otherwise required under applicable law.",

      "The amount of the refund shall ordinarily correspond to the amount actually paid by the User for the affected Product and any other amount that is legally required to be refunded in the particular circumstances. Where an Order contains multiple Products and only one Product is affected, the refund shall ordinarily relate to the affected Product or affected component of the Order rather than automatically extending to unaffected Products.",

      "Where shipping charges, handling charges, discounts, promotional benefits, wallet credits or other components form part of the transaction, the refund calculation may be adjusted in accordance with the nature of the cancellation or complaint and the terms applicable to the relevant Order, subject always to mandatory legal requirements.",

      "No provision relating to deduction, adjustment or exclusion shall be applied where doing so would unlawfully deprive the User of a statutory refund or other mandatory remedy.",
    ],
  },

  {
    title: " Payment Processing Through Razorpay",
    list: [
      "Where a User makes payment for an Order through Razorpay or any payment gateway integrated with the Native91 Platform, the payment transaction may be processed, authenticated, routed or otherwise facilitated by Razorpay, the relevant bank, card network, UPI service provider or other financial institution involved in the transaction. Native91 may rely upon the transaction status and payment confirmation received through the applicable payment gateway or financial intermediary for purposes of confirming receipt of payment.",

      "Where a refund has been approved in accordance with this Policy, Native91 may initiate the refund through Razorpay or the relevant payment gateway through which the original transaction was processed. The refund shall ordinarily be directed to the original payment instrument or payment source used for the Order, subject to the technical capabilities and applicable procedures of Razorpay, the relevant bank, card issuer, card network, UPI provider or other payment intermediary.",

      "The User acknowledges that the initiation of a refund by Native91 or Razorpay does not necessarily mean that the refunded amount will immediately become available in the User’s bank account or payment instrument. The actual time required for the refund to be credited may depend upon the payment method, banking institution, card network, UPI infrastructure, Razorpay and other financial intermediaries involved in processing the transaction.",

      "Native91 shall not be responsible for a delay in the receipt of an approved refund to the extent such delay is caused by Razorpay, the User’s bank, card issuer, card network, UPI service provider or another third-party financial intermediary, provided that Native91 has duly initiated the refund in accordance with this Policy. Where reasonably required, Native91 may provide the User with relevant refund or transaction reference details to facilitate tracing of the payment with the concerned payment intermediary.",

      "Razorpay’s role in processing a payment or refund shall not alter or restrict any refund, cancellation, exchange or other consumer remedy to which the User is otherwise entitled under this Policy or applicable law. In the event of any conflict between the operational terms of a payment gateway and a mandatory statutory right of the User, the applicable statutory requirement shall prevail to the extent of such inconsistency.",

      "Refunds shall ordinarily be processed through the same payment method originally used by the User for the relevant Order. This approach is intended to maintain transaction traceability, reduce payment-related disputes and ensure that funds are returned to the source from which payment was received.",

      "In circumstances where the original payment method cannot accept a refund, Native91 may use another reasonable and verifiable refund mechanism. This may arise, for example, where the original card has expired, the relevant payment instrument is no longer capable of receiving credits, or the transaction was completed through Cash on Delivery.",

      "Where appropriate and subject to verification, Native91 may provide a refund through Wallet or Store Credit in accordance with the applicable provisions governing Native91’s wallet or store-credit facility. Where a direct refund is appropriate and operationally available, Native91 may also process the amount through a bank transfer, including NEFT or UPI-linked transfer, to a bank account or payment destination nominated and verified by the User.",

      "Native91 may require reasonable verification before processing a refund to a newly nominated bank account or payment destination in order to prevent fraudulent diversion of funds. Users should therefore ensure that the information supplied for an alternative refund method is accurate and belongs to the rightful recipient of the transaction.",
    ],
  },

  {
    title: "Refund Processing Time",
    list: [
      "Refund processing involves multiple stages, including verification of the request where required, approval of the applicable remedy, processing through the relevant payment gateway or financial institution, and final credit by the receiving bank or payment provider.",

      "Accordingly, the date on which Native91 initiates a refund may not be the same date on which the amount becomes available in the User’s account. Banking systems, payment gateways, card networks and other financial intermediaries may require additional processing time.",

      "Native91 shall endeavour to initiate approved refunds within a reasonable operational period. Any additional time required by the User’s bank, card issuer, payment gateway, UPI provider or other financial intermediary shall be outside Native91’s direct control.",

      "Where a User believes that an approved refund has not been received within the applicable processing period, the User should contact Native91 with the Order number and relevant payment information so that the transaction can be traced and, where appropriate, the matter may be escalated to the relevant payment intermediary.",
    ],
  },

  {
    title: " Treatment Of Shipping And Related Charges",
    list: [
      "Shipping charges may be calculated separately from the Product price depending upon the Order, delivery location, cart value and applicable logistics rates. The applicable charges shall ordinarily be disclosed to the User before completion of payment.",

      "Where a User voluntarily cancels a qualifying Order before dispatch, the treatment of shipping charges, if already charged, shall depend upon whether the shipping service has actually been initiated or whether applicable law otherwise requires such amount to be returned.",

      "Where a refund arises because of a defective, damaged, incorrect or materially non-conforming Product, the treatment of shipping and associated charges shall be determined according to the circumstances and applicable law.",

      "Native91 may not refund charges relating to services already validly provided where such charges are lawfully non-refundable. However, no such provision shall override a mandatory consumer remedy or prevent recovery of amounts that the User is legally entitled to receive.",
    ],
  },

  {
    title: " Promotional Discounts, Coupons And Offers",
    list: [
      "Where an Order is placed using a promotional code, discount, coupon, store credit or other promotional benefit, the treatment of such benefit upon cancellation, exchange or refund may depend upon the terms of the relevant promotional offer.",

      "Where only one Product from a multi-Product Order is cancelled or refunded, the refund may be calculated by reference to the actual amount attributable to the affected Product after applying the relevant discount mechanism, subject to applicable law.",

      "Promotional benefits that were conditional upon purchasing a particular quantity, value or combination of Products may cease to apply if cancellation or refund causes the Order to no longer satisfy the conditions of the promotional offer. Any adjustment shall be made transparently and consistently with the applicable offer terms and shall not be used to defeat a statutory entitlement.",
    ],
  },

  {
    title: " Multi-Item And Multi-Seller Orders",
    list: [
      "Where a User places an Order containing Products supplied by more than one Seller, or where different Products forming part of one transaction are dispatched separately, each Product or Seller shipment shall generally be evaluated independently for purposes of cancellation, exchange and refund.",

      "Cancellation, refund or exchange of one Product shall not automatically create a right to cancel or return the remaining Products contained in the same overall Order. Each Product shall be assessed according to its own eligibility, fulfilment status, Seller, condition and applicable grounds for cancellation or refund.",

      "Similarly, where one Product is defective or incorrectly supplied but another Product from the same Order has been correctly delivered and does not independently qualify for a remedy, the User shall not ordinarily be entitled to a refund for the unaffected Product merely because it formed part of the same Order.",

      "Where a discount, shipping charge or promotional benefit was calculated on the basis of the combined Order, Native91 may make reasonable adjustments to the refund calculation, subject to applicable law.",
    ],
  },

  {
    title: "Personalised, Customised And Made-To-Order Products",
    list: [
      "Personalised, customised and made-to-order Products require particular treatment because production may begin only after an Order is received and may involve materials, measurements, designs, inscriptions, colours, specifications or other requirements selected specifically by the User.",

      "A User should therefore carefully review all personalisation and customisation information before placing an Order. A change-of-mind cancellation or return may not ordinarily be available after production has commenced, particularly where the Product cannot reasonably be resold to another User in its customised form.",

      "This restriction shall not apply where the Product is defective, materially different from the agreed specifications, incorrectly personalised due to a Seller error, damaged in transit, unsafe, or otherwise subject to a statutory remedy.",

      "Where a personalised or customised Product is affected by a qualifying defect or fulfilment error, Native91 may coordinate with the Seller to determine whether correction, replacement or refund is the most appropriate remedy.",
    ],
  },

  {
    title: " Handmade, Artisan And Small-Batch Products",
    list: [
      "Native91 hosts Products that may be created using traditional, artisanal, handmade or small-batch production methods. Such Products may exhibit reasonable variations in texture, colour, pattern, dimensions, finish, grain or appearance. Such variations may be an inherent characteristic of the manufacturing process rather than evidence of a defect.",

      "The User’s assessment of a complaint shall therefore take into account the Product description and the nature of the Product. A reasonable variation that was disclosed or is ordinarily inherent in the relevant Product category shall not automatically qualify for return or refund.",

      "However, an artisan or handmade description shall not be used to excuse a genuine defect, material damage, substantial deviation from the Product description, incorrect fulfilment or safety issue. Where a Product materially fails to conform to the representations made at the time of sale, the User may pursue the applicable remedy under this Policy and applicable law.",
    ],
  },

  {
    title: " Food And Consumable Products",
    list: [
      "Where Native91 offers food, beverages, edible goods or other consumable Products, Users should examine the relevant Product information, packaging, expiry or best-before information, storage requirements and other applicable details before purchase and upon delivery.",

      "Because of the nature of consumable Products, a change-of-mind return may ordinarily not be appropriate after delivery or opening, particularly where the Product is perishable or subject to hygiene and safety considerations. This limitation shall not affect remedies available where a consumable Product is spoiled, contaminated, materially damaged, incorrectly supplied, unsafe, expired when it should not have been, or otherwise fails to conform to applicable requirements.",

      "Where a complaint concerns a consumable Product, the User should promptly preserve the Product and relevant packaging and contact Native91 so that the matter can be assessed appropriately.",
    ],
  },

  {
    title: " Safety, Regulatory And Product-Compliance Complaints",
    list: [
      "Where a User reasonably believes that a Product presents a safety risk, violates a mandatory regulatory requirement, contains prohibited or undeclared material, or otherwise raises a serious product-compliance concern, the User should notify Native91 promptly.",

      "Native91 may temporarily suspend the relevant listing, notify the Seller, investigate the matter, coordinate with relevant service providers and take other appropriate measures depending upon the seriousness of the issue.",

      "A Product safety complaint shall be assessed separately from a mere change-of-mind request. Where applicable law requires a recall, replacement, refund or other consumer remedy, Native91 shall take reasonable steps to facilitate the applicable response.",
    ],
  },

  {
    title: "Failed Delivery, Refusal And Unavailability Of The User",
    list: [
      "Where a User is unavailable to receive an Order, provides an incorrect or incomplete address, repeatedly refuses delivery without a qualifying reason, or otherwise prevents successful delivery, the logistics partner may make repeated delivery attempts in accordance with the applicable shipping arrangements.",

      "Where delivery cannot be completed after the applicable attempts and the Product is returned to the Seller, any refund shall be assessed in accordance with the circumstances of the failed delivery, the applicable Order terms and applicable law.",

      "Where a User’s conduct repeatedly results in failed deliveries, misuse of Cash on Delivery, unjustified refusals or similar operational losses, Native91 may take proportionate measures to protect the integrity of the Platform, including restricting certain delivery or payment privileges in accordance with this Policy and the broader Terms of Use.",
    ],
  },

  {
    title: "Cancellation, Refund And Exchange In Exceptional Circumstances",
    list: [
      "There may be circumstances in which fulfilment of an Order becomes impossible or commercially impracticable due to events outside the reasonable control of Native91 or the relevant Seller. Such circumstances may include natural disasters, government restrictions, regulatory action, widespread logistics disruption, strikes, civil disturbances, technical failures, extraordinary transportation interruptions or other force majeure circumstances.",

      "Where such an event affects an Order, Native91 shall use reasonable efforts to communicate relevant information to the User and determine whether fulfilment can resume within a reasonable period.",

      "Where an Order cannot ultimately be fulfilled and is cancelled, any refund due to the User shall be processed in accordance with the applicable provisions of this Policy and applicable law.",
    ],
  },

  {
    title: " Fraudulent, Abusive Or Unsubstantiated Claims",
    list: [
      "Native91 seeks to ensure that the refund and exchange mechanism remains accessible to genuine Users while protecting Sellers, logistics partners and the Platform against fraudulent or abusive use.",

      "A User must not knowingly submit a false complaint, misrepresent the condition of a Product, manipulate photographs or videos, falsely claim non-delivery, repeatedly seek refunds for Products that were correctly supplied, return a materially different Product from the one delivered, or otherwise attempt to obtain an unjustified financial benefit through the refund or exchange process.",

      "Where Native91 identifies repeated, unsubstantiated or fraudulent requests, it may undertake additional verification before processing future claims. In appropriate circumstances, Native91 may restrict Cash-on-Delivery privileges, restrict certain Platform benefits, suspend relevant Account functionality or temporarily or permanently suspend the User’s Account, subject to applicable law.",

      "Any such action shall be without prejudice to other contractual, civil or legal remedies available to Native91 or affected Sellers.",
    ],
  },

  {
    title: " Restriction Of Platform Privileges",
    list: [
      "Native91 may impose reasonable restrictions on particular Platform privileges where a User repeatedly engages in conduct that causes operational abuse or materially interferes with the functioning of the Platform.",

      "Such circumstances may include repeated unjustified cancellations after dispatch, persistent refusal to accept correctly fulfilled Cash-on-Delivery Orders, repeated unsupported claims of damage or non-delivery, misuse of exchange mechanisms, manipulation of promotional offers or other conduct indicating abuse of the Platform’s refund and cancellation framework.",

      "Restrictions may include temporary or permanent withdrawal of Cash-on-Delivery availability, limitations on certain promotional benefits or other reasonable measures proportionate to the conduct concerned.",

      "Such restrictions shall not be interpreted as removing a User’s statutory consumer rights or preventing the User from raising a genuine complaint concerning a defective, unsafe, damaged, incorrect or materially non-conforming Product.",
    ],
  },

  {
    title: " User’s Duty To Provide Accurate Information",
    list: [
      "The User is responsible for providing accurate and complete information when placing an Order and when raising a cancellation, refund or exchange request. This includes the correct delivery address, contact information, Product details, reason for the complaint and any information necessary to process the request.",

      "Where a refund is to be made through an alternative payment mechanism, the User is responsible for providing accurate banking or payment details and completing any verification reasonably required by Native91.",

      "Native91 shall not be responsible for delays or failed transfers resulting directly from inaccurate or incomplete information supplied by the User, subject to applicable law and provided that Native91 has otherwise acted with reasonable care.",
    ],
  },

  {
    title: "Grievance Redressal",
    list: [
      "Where a User is dissatisfied with the handling of a refund, cancellation or exchange request, the User may escalate the matter through Native91’s designated grievance mechanism and contact the Grievance Officer using the details published on the Platform.",

      "The grievance should preferably contain the Order number, relevant transaction information, details of the complaint, the remedy requested and copies of any previous correspondence or supporting evidence.",

      "Native91 shall endeavour to review grievances fairly and within the timeframes prescribed by applicable law and its internal grievance process.",

      "The existence of Native91’s internal grievance mechanism does not prevent a User from approaching the National Consumer Helpline, an appropriate Consumer Disputes Redressal Commission or any other competent statutory authority where such recourse is available.",
    ],
  },

  {
    title: " No Waiver Of Legal Rights",
    list: [
      "Nothing contained in this Policy shall be interpreted as requiring a User to surrender, waive or contract out of a mandatory right available under applicable consumer, contract, e-commerce, product-safety or other applicable law.",

      "Where any provision of this Policy is found to be inconsistent with a mandatory statutory requirement, the relevant statutory requirement shall prevail to the extent of such inconsistency, while the remaining provisions shall continue to operate to the maximum extent legally permissible.",

      "The purpose of this Policy is to establish an operational framework for ordinary transactions and complaints and not to restrict the jurisdiction or authority of any statutory body.",
    ],
  },

  {
    title: "Policy Administration And Amendments",
    list: [
      "Native91 may revise this Refund, Return, Exchange and Cancellation Policy from time to time to reflect changes in applicable law, regulatory requirements, payment systems, logistics arrangements, Platform features, Seller practices or business operations.",

      "Any material modification affecting the rights or obligations of Users shall be communicated through appropriate means in accordance with the applicable Terms of Use and legal requirements. The revised Policy shall apply prospectively to Orders placed after the effective date unless applicable law requires otherwise.",

      "A User is encouraged to review the applicable Policy before placing an Order, particularly where the Product is personalised, made-to-order, consumable, fragile or otherwise subject to specific return or exchange conditions.",
    ],
  },

  {
    title: "Interpretation Of Product-Specific Terms",
    list: [
      "Where the Product page contains specific information regarding cancellation, exchange, return eligibility, delivery condition, personalisation, size, material, shelf life or other Product-specific matters, such information shall be considered together with this Policy.",

      "A Product-specific condition cannot, however, be interpreted as excluding a statutory consumer right that cannot lawfully be excluded.",

      "Where there is uncertainty regarding whether a particular complaint qualifies for a remedy, Native91 may assess the circumstances on a case-by-case basis, taking into account the Product description, Order details, evidence provided, Seller information, fulfilment records and applicable legal requirements.",
    ],
  },

  {
    title:
      " Final Framework For Refund, Return, Exchange And Cancellation Requests",
    list: [
      "This Policy is intended to provide Users with a clear and predictable process while recognising the distinctive characteristics of Products available through Native91. The absence of a general change-of-mind return should not be confused with the absence of remedies for genuine defects, damage, incorrect fulfilment, material non-conformity or other circumstances protected by law.",

      "Users should carefully review Product information before purchase, particularly in relation to Products that are handmade, personalised, customised, made-to-order, perishable or produced in small batches. At the same time, Sellers are expected to fulfil Orders accurately, comply with applicable Product standards and provide Products consistent with the descriptions and representations made on the Platform.",

      "Native91 shall use reasonable efforts to facilitate communication between Users, Sellers and logistics partners and to process eligible cancellation, exchange and refund requests in accordance with this Policy. Where a Product qualifies for a remedy, the appropriate remedy shall be determined having regard to the nature of the issue, the availability of replacement or repair, the circumstances of the transaction and the rights available to the User under applicable law.",

      "A User’s legitimate statutory rights shall remain unaffected by the operational restrictions contained in this Policy. Conversely, the availability of statutory rights shall not prevent Native91 from adopting reasonable verification procedures or proportionate measures against fraudulent, abusive or bad-faith use of the Platform.",

      "By placing an Order through Native91, the User acknowledges that the Product-specific conditions, applicable Seller terms, Terms of Use, Shipping and Delivery Policy and this Refund, Return, Exchange and Cancellation Policy are intended to operate together as part of the overall contractual and operational framework governing the transaction, subject always to mandatory provisions of applicable law.",
    ],
  },
];

const Return = () => {
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

      <div className="refund-page lexend">
        <div
          className="scroll-progress"
          style={{ width: `${progress}%` }}
        ></div>

        <section className="refund-hero">
          <div className="container text-center">
            <span className="badge bg-light text-danger mb-3">
              Return • Refund • Cancellation
            </span>

            <h1 data-aos="fade-down">Return, Refund & Cancellation Policy</h1>

            <p data-aos="fade-up">Last Updated : September 2, 2026</p>
          </div>
        </section>

        <div className="container py-5">
          <div className="row">
            <div className="col-lg-3">
              <div className="sidebar sticky-top">
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
                <h2>Customer Satisfaction Comes First</h2>

                <p>
                  At <strong>Native91</strong>, customer satisfaction is
                  our priority. This policy explains the conditions under which
                  returns, refunds and cancellations are accepted.
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

                  {item.eligible && (
                    <>
                      <h5 className="text-success mt-3">Eligible</h5>

                      <ul>
                        {item.eligible.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.notEligible && (
                    <>
                      <h5 className="text-danger mt-3">Not Eligible</h5>

                      <ul>
                        {item.notEligible.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.ourError && (
                    <>
                      <h5 className="text-success mt-3">Our Error</h5>

                      <ul>
                        {item.ourError.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.customer && (
                    <>
                      <h5 className="text-primary mt-3">Customer Initiated</h5>

                      <ul>
                        {item.customer.map((x, index) => (
                          <li key={index}>{x}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {item.note && (
                    <div className="alert alert-warning mt-3">{item.note}</div>
                  )}
                </div>
              ))}

              <div className="policy-card" data-aos="fade-up">
                <h3>
                  <i className="bi bi-envelope-paper"></i>
                  Contact Us
                </h3>

                <p>
                  <strong>Customer Support</strong>
                </p>

                <p>Email : support@native91.com</p>

                <p>
                  Monday – Saturday
                  <br />
                  10:00 AM – 6:00 PM
                </p>

                <p>
                  We aim to respond within
                  <strong> 24–48 business hours.</strong>
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

export default Return;
