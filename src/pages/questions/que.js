import React, { useMemo, useState } from "react";
import "./que.css";

const faqData = [
  {
    category: "about",
    section: "About Native91",
    questions: [
      {
        question: "What is Native91?",
        text: "what is native91 marketplace curated premium invite only",
        answer:
          "Native91 is a curated, premium, invite-only online marketplace for exceptional homegrown Indian brands. We bring carefully selected brands together to create a premium destination where customers can discover and shop remarkable Indian products.",
      },
      {
        question: "How is Native91 different from mass marketplaces?",
        text: "different mass marketplaces amazon flipkart",
        answer:
          "Mass marketplaces focus on scale and thousands of sellers. Native91 focuses on curation, discovery and quality. We intentionally limit representation within categories so strong brands have a better opportunity to stand out.",
      },
      {
        question: "Who is the target customer?",
        text: "target customer audience shoppers",
        answer:
          "Native91 is aimed at customers who appreciate quality, craftsmanship, originality and discovering exceptional Indian brands.",
      },
      {
        question: "When is Native91 launching?",
        text: "launch september",
        answer:
          "Native91 is preparing for its September launch and is currently onboarding a select group of Founding Brands.",
      },
    ],
  },

  {
    category: "benefits",
    section: "Why Join Native91",
    questions: [
      {
        question: "What are the benefits for brands?",
        text: "benefits visibility discovery customers homepage social media campaigns",
        answer:
          "Native91 is designed to help brands reach new customers, increase online visibility and discovery, participate in curated collections and campaigns, access featured placements, and benefit from social media, content, seasonal campaigns and creator collaborations.",
      },
      {
        question: "What is a Founding Brand?",
        text: "founding brand early launch",
        answer:
          "Founding Brands are the select group of brands joining Native91 during the launch phase. They have the opportunity to establish their presence early and participate in initial launch and discovery initiatives.",
      },
      {
        question: "What is the Founding Brand launch benefit?",
        text: "free september october",
        answer: (
          <>
            <strong>September and October are completely free</strong> for
            Founding Brands as a special launch benefit. There is no platform
            access fee during these two months.
          </>
        ),
      },
      {
        question:
          "Can I join if I already sell on my website or other marketplaces?",
        text: "existing website marketplace",
        answer:
          "Yes. Native91 can work alongside your existing website and other sales channels, providing an additional channel for customer discovery, visibility and sales.",
      },
    ],
  },

  {
    category: "commercials",
    section: "Commercials",
    questions: [
      {
        question: "What is the commission structure?",
        text: "commission fee paid period",
        answer:
          "September and October are free for Founding Brands from the platform access perspective. The applicable commission structure after the complimentary period will be communicated clearly before the paid period begins.",
      },
      {
        question: "Are there any upfront joining fees?",
        text: "upfront joining fee cost",
        answer:
          "There is no upfront platform access fee during September and October for Founding Brands.",
      },
      {
        question: "Is joining Native91 a long-term commitment?",
        text: "commitment contract long term",
        answer:
          "The Founding Brand programme is designed to let brands experience Native91 during the launch phase with September and October completely free. Commercial terms after the complimentary period will be shared clearly beforehand.",
      },
    ],
  },

  {
    category: "onboarding",
    section: "Onboarding",
    questions: [
      {
        question: "How does the onboarding process work?",
        text: "registration verification product upload approval live",
        answer: (
          <>
            <ol>
              <li>Brand registration</li>
              <li>Brand verification and approval</li>
              <li>Submit required brand and product information</li>
              <li>Upload products and relevant details</li>
              <li>Product review and approval</li>
              <li>Products go live on Native91</li>
            </ol>

            <p className="mb-0">
              Our team will guide you throughout the process.
            </p>
          </>
        ),
      },
      {
        question: "What information do I need to provide?",
        text: "information documents images pricing",
        answer:
          "We will need basic brand information, product details, images, pricing and other information required to create your brand and product listings.",
      },
      {
        question: "How long does onboarding take?",
        text: "timeline how long",
        answer:
          "The timeline depends mainly on how quickly the required brand and product information is provided. Our team will assist you throughout the process.",
      },
    ],
  },

  {
    category: "orders",
    section: "Orders & Fulfilment",
    questions: [
      {
        question: "How will orders work?",
        text: "orders customer purchase notification",
        answer:
          "Once your products are live, customers can discover and purchase them through Native91. When an order is placed, the brand will receive the relevant order information and fulfilment instructions.",
      },
      {
        question: "Who handles fulfilment?",
        text: "fulfilment seller dispatch",
        answer:
          "Brands will be responsible for preparing and dispatching their orders according to the agreed fulfilment process. Native91 facilitates the marketplace experience and customer journey.",
      },
      {
        question: "What about shipping?",
        text: "shipping courier tracking",
        answer:
          "Shipping and fulfilment will follow the process established during onboarding. The exact workflow and requirements will be explained before going live.",
      },
      {
        question: "What about returns and refunds?",
        text: "returns refunds cancellations",
        answer:
          "Returns, cancellations and refunds will follow Native91's marketplace policies and applicable product/category requirements. These details will be clearly explained during onboarding.",
      },
      {
        question: "When will I receive my payment?",
        text: "payout payment settlement",
        answer:
          "The payout cycle and settlement process will be communicated as part of the commercial and onboarding documentation before your brand goes live.",
      },
    ],
  },

  {
    category: "marketing",
    section: "Marketing & Visibility",
    questions: [
      {
        question: "How will Native91 promote my brand?",
        text: "promotion marketing homepage category social creator influencer",
        answer:
          "Depending on campaign and brand fit, opportunities can include homepage features, category features, curated collections, seasonal campaigns, gift guides, social media promotion, content marketing, creator/influencer collaborations, brand spotlights and performance-driven marketing initiatives.",
      },
      {
        question: "Will every brand get the same visibility?",
        text: "same visibility placements exposure",
        answer:
          "Native91 uses a combination of curation, campaigns, customer demand and performance to determine visibility. Specific placements depend on campaign and category fit.",
      },
      {
        question: "Will Native91 guarantee sales?",
        text: "sales guarantee customers traffic",
        answer:
          "Our objective is to actively drive brand discovery through curated collections, content, social media, campaigns and partnerships. However, as with any marketplace, sales cannot be guaranteed.",
      },
    ],
  },
];

const filters = [
  { label: "All", value: "all" },
  { label: "About", value: "about" },
  { label: "Why Join", value: "benefits" },
  { label: "Commercials", value: "commercials" },
  { label: "Onboarding", value: "onboarding" },
  { label: "Orders & Shipping", value: "orders" },
  { label: "Marketing", value: "marketing" },
];

const navigation = [
  { label: "About Native91", target: "about" },
  { label: "Why Join", target: "benefits" },
  { label: "Commercials", target: "commercials" },
  { label: "Onboarding", target: "onboarding" },
  { label: "Orders & Fulfilment", target: "orders" },
  { label: "Marketing & Visibility", target: "marketing" },
];

const FoundingBrandFAQ = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [openIndex, setOpenIndex] = useState(null);

  const filteredSections = useMemo(() => {
    const query = search.toLowerCase().trim();

    return faqData
      .map((section) => {
        if (activeCategory !== "all" && section.category !== activeCategory) {
          return null;
        }

        const questions = section.questions.filter((item) => {
          if (!query) return true;

          return (
            item.text.toLowerCase().includes(query) ||
            item.question.toLowerCase().includes(query) ||
            getAnswerText(item.answer).toLowerCase().includes(query)
          );
        });

        if (questions.length === 0) return null;

        return {
          ...section,
          questions,
        };
      })
      .filter(Boolean);
  }, [search, activeCategory]);

  const totalQuestions = filteredSections.reduce(
    (total, section) => total + section.questions.length,
    0,
  );

  const handleFilter = (category) => {
    setActiveCategory(category);
    setOpenIndex(null);
  };

  const scrollToSection = (target) => {
    const element = document.querySelector(`[data-section="${target}"]`);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleAccordion = (sectionCategory, questionIndex) => {
    const key = `${sectionCategory}-${questionIndex}`;

    setOpenIndex((current) => (current === key ? null : key));
  };

  return (
    <div className="native91-faq-page lexend">
      {/* Hero */}
      <header className="native91-hero">
        <div className="native91-wrap">
          <div className="native91-tag">Founding Brand Guide</div>

          <h1>Everything you need to know about Native91.</h1>

          <p>
            A curated, premium, invite-only marketplace for exceptional
            homegrown Indian brands — built around discovery, quality and
            meaningful brand visibility.
          </p>

          <div className="native91-pills">
            <span className="native91-pill">September Launch</span>
            <span className="native91-pill">Founding Brands</span>
            <span className="native91-pill">September + October Free</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="native91-content">
        <div className="native91-card">
          {/* Toolbar */}
          <div className="native91-toolbar">
            <div className="native91-search-row">
              <input
                type="search"
                className="native91-search"
                placeholder="Search your question..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <div className="native91-count">
                {totalQuestions}{" "}
                {totalQuestions === 1 ? "question" : "questions"}
              </div>
            </div>

            <div className="native91-filters">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  className={`native91-filter ${
                    activeCategory === filter.value ? "active" : ""
                  }`}
                  onClick={() => handleFilter(filter.value)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="native91-layout">
            {/* Sidebar */}
            <aside className="native91-side">
              <b>Quick Navigation</b>

              {navigation.map((item) => (
                <button
                  key={item.target}
                  type="button"
                  className="native91-jump"
                  onClick={() => scrollToSection(item.target)}
                >
                  {item.label}
                </button>
              ))}
            </aside>

            {/* FAQ */}
            <div className="native91-faq">
              {filteredSections.map((section) => (
                <section
                  className="native91-section"
                  data-section={section.category}
                  key={section.category}
                >
                  <h2>{section.section}</h2>

                  {section.questions.map((item, index) => {
                    const accordionKey = `${section.category}-${index}`;
                    const isOpen = openIndex === accordionKey;

                    return (
                      <div
                        className={`native91-detail ${isOpen ? "open" : ""}`}
                        key={item.question}
                      >
                        <button
                          type="button"
                          className="native91-summary"
                          onClick={() =>
                            handleAccordion(section.category, index)
                          }
                        >
                          <span>{item.question}</span>

                          <span className="native91-plus">
                            {isOpen ? "−" : "+"}
                          </span>
                        </button>

                        {isOpen && (
                          <div className="native91-answer">
                            {typeof item.answer === "string"
                              ? item.answer
                              : item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </section>
              ))}

              {filteredSections.length === 0 && (
                <div className="native91-no-results">
                  <h3>No questions found</h3>
                  <p>
                    Try searching with a different keyword or select another
                    category.
                  </p>
                </div>
              )}

              {/* CTA */}
              <section className="native91-cta">
                <h2>Ready to be part of Native91?</h2>

                <p>
                  We are currently onboarding a select group of Founding Brands
                  ahead of our September launch. September and October are
                  completely free for Founding Brands.
                </p>

                <a
                  href="https://native91.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="native91-btn"
                >
                  Start Your Onboarding →
                </a>
              </section>

              <div className="native91-footer">
                Native91 · Reserved for the Remarkable
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const getAnswerText = (answer) => {
  if (typeof answer === "string") {
    return answer;
  }

  return "";
};

export default FoundingBrandFAQ;
