import { useState, useRef, useEffect } from "react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

// ─── THEME ───────────────────────────────────────────────────────────────────
const BG = "#0B0F1A";
const CARD = "#111827";
const BORDER = "#1F2937";
const TEXT = "#F1F5F9";
const MUTED = "#64748B";
const SUBTLE = "#1E293B";
const riskColor = (r) => r >= 8 ? "#FB7185" : r >= 6 ? "#FBBF24" : r >= 4 ? "#A3E635" : "#4ADE80";
const scoreColor = (s) => s >= 5 ? "#4ADE80" : s >= 4 ? "#A3E635" : s >= 3 ? "#FBBF24" : s >= 2 ? "#FB923C" : "#FB7185";

// ─── DEFINITIONS ─────────────────────────────────────────────────────────────
const DEFINITIONS = {
  "Market Cap": "What the entire company is worth today if you bought every single share. Think of it like the price tag on the whole business.",
  "AI Spend": "How much money this company is investing in artificial intelligence this year — building data centers, hiring researchers, and developing new AI products.",
  "Revenue": "All the money the company earns before paying any expenses. The raw total of what customers and advertisers pay them.",
  "Risk Level": "How likely something could go seriously wrong with this company's AI strategy. 1 is very safe, 10 is very risky.",
  "AI Model": "The actual brain behind their AI. How smart and capable is the AI they've built compared to everyone else?",
  "Distribution": "How many people they can reach instantly without spending extra money. Meta has 3.56 billion daily users — a startup would spend billions to reach that many.",
  "Data Moat": "The more data a company collects, the smarter their AI gets. A data moat means they've collected so much data that competitors can't catch up even if they try.",
  "Hardware": "Do they own the physical chips running their AI, or rent them? Owning gives a major cost and speed advantage.",
  "Monetization": "How well is the company turning their AI investment into actual money?",
  "Research": "How advanced is their AI science team compared to everyone else? Google's DeepMind solved a 50-year biology problem — that's world-class research.",
  "Supply Chain": "One company selling something essential to another. Without Nvidia's chips, most AI companies couldn't run their systems.",
  "Primary AI": "The main AI product or technology this company has built or is deploying.",
  "Biggest Threat": "The single most important thing that could seriously damage or derail this company's AI strategy.",
  "Ambition": "How ambitious is this goal? 5 filled squares means they're swinging for something huge. 1 square means it's a smaller, targeted move.",
  "Likelihood": "How realistic is it that this company actually pulls this off? 5 green squares means very likely. 1 square means it's a long shot.",
  "Good Signs": "Signals that tell you the company's AI strategy is working. Watch for these in news and earnings reports.",
  "Warning Signs": "Early warning signals that something may be going wrong. Pay attention if you see these in the news.",
};

// ─── SIGNALS DATA ────────────────────────────────────────────────────────────
const SIGNALS = {
  META: {
    green: [
      { text: "ARPU and CPMs rising consistently quarter over quarter", what: "ARPU stands for Average Revenue Per User — how much money Meta makes from each person on their platforms. CPM stands for Cost Per Mille — what advertisers pay per 1,000 times their ad is shown. When both rise together it means advertisers are paying more to reach Meta's users.", why: "This is the most direct proof that Meta's AI ad targeting is working. When AI shows the right ad to the right person, advertisers get better results and pay more. Rising CPMs with the same user base means Meta is generating more revenue without needing more users — pure AI-driven efficiency." },
      { text: "Meta AI monthly active users approaching ChatGPT scale", what: "Monthly active users is simply how many people are actually using Meta AI at least once a month. ChatGPT currently has around 400 million monthly active users. If Meta AI approaches that number it means people inside Facebook, Instagram, and WhatsApp are genuinely choosing to use the AI assistant.", why: "Distribution is only valuable if people actually use the product. Meta has 3.56 billion people on their platforms — but having access to something and choosing to use it are very different things. If Meta AI usage approaches ChatGPT scale it validates Meta's entire AI thesis." },
      { text: "Subscription adoption accelerates — milestones disclosed publicly", what: "Meta is building paid subscription tiers with more powerful AI features. If they start announcing subscriber milestones publicly — '1 million subscribers', '5 million subscribers' — it means people are willing to pay directly for Meta AI.", why: "Right now Meta makes money from AI indirectly through better ads. A subscription model with real adoption numbers creates a direct line between AI and revenue. Companies announce good numbers. They bury bad ones — so public milestones signal real confidence." },
      { text: "Free cash flow stabilizes while revenue growth stays above 25%", what: "Free cash flow is the money left over after all expenses and investments are paid. Meta is spending $145 billion on AI this year. If revenue keeps growing above 25% while that massive spending stabilizes, it means the investment is paying for itself.", why: "The market's biggest fear is that Meta is spending $145 billion on bets that won't pay off. If revenue growth stays strong while free cash flow stabilizes, it proves the AI spending is self-funding — removing the biggest bear case against Meta." },
      { text: "Ray-Ban sales growing, AR timeline staying on track", what: "Ray-Ban Meta smart glasses are a real product you can buy today — sunglasses with a built-in AI assistant and camera. Growing sales means consumers are actually buying and using AI-embedded wearables.", why: "If Ray-Ban Meta glasses gain real traction it validates the entire hardware AI strategy. It proves consumers will wear AI — which is the foundation of Meta's 10-year vision. Genuine sales growth signals Meta has identified a viable AI hardware market before Apple or Google." },
      { text: "WhatsApp Business API generating meaningful enterprise revenue", what: "WhatsApp Business API lets companies pay Meta to send messages to customers on WhatsApp — order confirmations, customer service, AI chatbots. In countries where WhatsApp dominates, this is effectively the business messaging infrastructure.", why: "WhatsApp has 2 billion daily users and has generated almost no revenue since Meta acquired it for $19 billion in 2014. If the Business API unlocks significant revenue, Meta has figured out how to monetize their second-biggest platform — nearly doubling the company's revenue potential." },
    ],
    red: [
      { text: "Revenue growth decelerates while capex keeps climbing past $145B", what: "Capex is capital expenditure — what Meta is spending on data centers, chips, and AI infrastructure. If revenue growth slows while spending keeps accelerating, the gap between what's coming in and going out widens dangerously.", why: "This is the scenario Wall Street fears most. Meta's $145 billion AI spend is justified by the assumption it will generate more revenue. If revenue growth decelerates while spending rises, investors will question whether the investment will ever pay off." },
      { text: "CPMs plateau despite AI investment — ads not actually improving", what: "If CPMs — what advertisers pay per 1,000 ad impressions — stop rising or start declining, advertisers aren't getting better results from Meta's AI-targeted ads. The AI improvements are hitting a ceiling.", why: "Meta's entire current AI success story is built on better ad targeting generating higher advertiser prices. If CPMs plateau, the AI thesis isn't working at the ad level — which is where 97% of Meta's revenue comes from." },
      { text: "Subscription launch lands quietly with no meaningful numbers", what: "If Meta launches their premium AI subscription and then goes quiet — no milestone announcements, no subscriber counts — it almost certainly means adoption is disappointing. Companies announce good numbers. They bury bad ones.", why: "Subscription revenue is supposed to be Meta's proof that AI can be directly monetized beyond advertising. A failed launch leaves Meta's entire non-advertising AI revenue strategy unproven." },
      { text: "Meta AI engagement stays low — people ignore it in the feed", what: "If Meta AI appears in Instagram and Facebook feeds but people consistently scroll past it and don't interact, engagement metrics will be low. People have access to the AI but are choosing not to use it.", why: "Having 3.56 billion users is only an advantage if those users engage with the AI. If the AI is present but ignored, Meta's distribution advantage evaporates. It would mean the fundamental premise that social media is the right delivery mechanism for consumer AI is wrong." },
      { text: "Free cash flow shrinking for multiple consecutive quarters", what: "Free cash flow shrinking for multiple quarters means Meta is spending significantly more than it's generating after operations. If this worsens consistently, the financial cushion shrinks dangerously.", why: "Sustained free cash flow decline signals the AI spending isn't self-funding. If the pattern continues without revenue acceleration, Meta faces difficult choices — slow AI investment or dilute shareholders." },
      { text: "Google wins the consumer AI habit battle on Android first", what: "Habits are formed in the first tool people reach for. If Android users — 3 billion people — develop the habit of using Gemini before Meta AI establishes itself, switching them to Meta AI becomes much harder. Digital habits are extremely sticky once formed.", why: "Consumer AI is a winner-take-most market. The assistant people use first becomes the one they keep using — the same way Google became the default search engine and never lost that position. If Gemini establishes itself first, Meta may permanently lose the consumer AI race." },
    ],
  },
  MSFT: {
    green: [
      { text: "Azure revenue growth sustaining consistently above 30%", what: "Azure is Microsoft's cloud computing platform. Revenue growing above 30% consistently means businesses are choosing Microsoft's cloud at an accelerating rate to run their AI workloads.", why: "Azure is where Microsoft's AI money actually comes from today. Sustained growth above 30% at Azure's scale adds tens of billions in new revenue each year. It proves AI demand is structural — not a temporary spike — and justifies Microsoft's $190 billion in annual AI spending." },
      { text: "Microsoft 365 Copilot seat adoption accelerating — user milestones announced", what: "A Copilot seat means one employee has been licensed to use AI inside Word, Excel, Teams, and Outlook for an extra $30 per month. Accelerating adoption means more companies are rolling it out to more employees.", why: "With 400 million existing Microsoft 365 users, every percentage point of Copilot adoption is worth $1.4 billion in annual incremental revenue. Accelerating adoption means this is becoming a standard enterprise tool — not a niche experiment." },
      { text: "GitHub Copilot subscribers expanding beyond developers into broader teams", what: "GitHub Copilot started as an AI for software developers that writes and completes code. Expanding beyond developers means non-technical employees are also adopting AI tools built on the GitHub platform.", why: "This signals GitHub Copilot is evolving from a developer tool into a broader enterprise AI platform. The addressable market expands dramatically from 100 million developers to hundreds of millions of knowledge workers." },
      { text: "Operating margins expanding as Copilot scales", what: "Operating margin is the percentage of revenue that becomes profit after costs. When Copilot scales — more people use it without proportional cost increases — the margin on each new Copilot dollar is very high.", why: "As Copilot grows relative to total revenue, Microsoft starts to look more like a software company — commanding higher profit margins. Expanding margins prove AI is creating genuine leverage in the business model." },
      { text: "Enterprise customers upgrading to full Copilot licenses at increasing rates", what: "Some companies buy limited Copilot access first to test it, then upgrade to full deployment across all employees. Increasing upgrade rates mean the trial customers are satisfied enough to roll it out broadly.", why: "Upgrade rates are the clearest signal of product satisfaction in enterprise software. Companies don't spend $30 per employee across thousands of employees unless the tool genuinely improves productivity." },
      { text: "Free cash flow recovering after capex compression period", what: "Microsoft has been spending heavily on AI infrastructure — $190 billion annually — which temporarily compressed free cash flow. Recovery means revenue is now growing fast enough to more than offset the massive investment.", why: "Free cash flow recovery is the financial signal that the AI investment cycle is maturing into returns. It proves Microsoft correctly timed its spending and that Copilot and Azure AI revenue is beginning to compound." },
    ],
    red: [
      { text: "Azure growth decelerating below 25% for multiple consecutive quarters", what: "If Azure's revenue growth rate falls below 25% and stays there across multiple quarters, it means the AI-driven demand boost is fading or competitors are winning more cloud deals.", why: "Azure growing below 25% would signal Microsoft is losing the AI cloud race. At that rate the gap between Azure and Google Cloud — currently growing at 63% — widens dramatically. It suggests the OpenAI partnership isn't the differentiating advantage the market assumed." },
      { text: "Copilot adoption disappoints — licenses bought but employees don't use it", what: "Companies might buy Copilot licenses as a corporate IT decision without employees actually using the product in daily work. If usage data shows low engagement despite high license counts, the product isn't delivering enough value to change behavior.", why: "License counts without usage are a vanity metric. Enterprise software that gets deployed but not used gets cancelled at renewal time. Low actual usage would create a renewal crisis 12-18 months down the line and undermine the entire Copilot revenue thesis." },
      { text: "OpenAI relationship fractures or OpenAI models fall behind competitors", what: "Microsoft's AI advantage is almost entirely derived from their exclusive partnership with OpenAI. If that relationship deteriorates or OpenAI's models fall behind Google's Gemini or Meta's Llama — Microsoft's AI differentiation narrows.", why: "45% of Microsoft's future cloud revenue backlog is tied to OpenAI. If OpenAI stumbles, Microsoft's AI growth story stumbles with it. No other major tech company's competitive position is so dependent on a single partner they don't fully control." },
      { text: "Google Workspace Gemini winning enterprise deals from Microsoft 365", what: "If companies that currently pay for Microsoft 365 start switching to Google Workspace to access Gemini AI, Microsoft loses both the base subscription and the Copilot AI revenue opportunity.", why: "Microsoft's moat in enterprise productivity has been considered nearly unbreakable for decades. If Google Workspace Gemini drives switching at scale, it would be the first serious threat to Microsoft Office's dominance in 30 years." },
      { text: "45% of cloud backlog tied to single OpenAI relationship — dangerous concentration", what: "A very large portion of Microsoft's future committed cloud revenue comes from OpenAI's usage of Azure. If OpenAI reduces Azure consumption, builds its own infrastructure, or struggles financially, that backlog evaporates.", why: "No financial analyst is comfortable with 45% of future revenue depending on one customer relationship that Microsoft doesn't control. This creates a scenario where OpenAI's decisions directly determine Microsoft's revenue trajectory." },
      { text: "AI sales teams struggling to convert enterprise interest into committed revenue", what: "Many companies are interested in AI and will take meetings, run pilots, and engage with Microsoft's sales teams. But interest doesn't equal revenue. If deals take longer to close or pilots don't convert, revenue growth will lag.", why: "Enterprise AI sales cycles are longer than Microsoft's previous software sales because AI requires workflow changes and IT security reviews. Consistently disappointing conversion rates would mean Microsoft's AI revenue growth falls short of optimistic projections." },
    ],
  },
  GOOGLE: {
    green: [
      { text: "Google Cloud sustaining above 40% growth — AI demand converting to revenue", what: "Google Cloud growing above 40% means businesses are choosing Google's cloud platform at an accelerating rate to run AI applications. 40% growth at Google Cloud's current scale adds tens of billions in new annual revenue.", why: "Google Cloud growing faster than Azure proves AI research advantage is translating into commercial wins. Sustained 40%+ growth would position Google Cloud to challenge Azure for second place in the global cloud market." },
      { text: "AI Overviews keeping search market share above 88%", what: "AI Overviews are the AI-generated answer boxes that appear at the top of Google Search results. Search market share above 88% means despite ChatGPT and Perplexity, the vast majority of people still choose Google when they want to search.", why: "Google's $175 billion advertising business depends entirely on people coming to Google to search. Maintaining above 88% market share despite aggressive AI competition proves Google has integrated AI into search without losing its fundamental user base." },
      { text: "Gemini becoming the default AI on Android globally", what: "Android runs on 3 billion smartphones. As Google replaces Google Assistant with Gemini as the default AI on new Android devices worldwide, Gemini becomes the AI that billions of people interact with every day without making any deliberate choice.", why: "Default status is the most powerful distribution advantage in consumer technology. If Gemini achieves the same default status on 3 billion Android devices that Google Search has on browsers, it creates a habit-formation advantage that is nearly impossible to overcome." },
      { text: "Google Workspace AI adoption competing with Microsoft Copilot on enterprise deals", what: "If companies choosing between Microsoft 365 Copilot and Google Workspace Gemini are selecting Google at increasing rates, it means Google's enterprise AI product is competitive enough to challenge Microsoft on its home turf.", why: "Microsoft has dominated enterprise productivity for 30 years. Any meaningful Google Workspace AI wins represent a historic shift in enterprise buying patterns. Even capturing 20% of the enterprise AI productivity market from Microsoft would mean tens of billions in new recurring revenue." },
      { text: "TPU availability on Google Cloud gaining meaningful customer traction", what: "Google's custom AI chips — TPUs — are now available for other companies to rent through Google Cloud. Meaningful traction means businesses are choosing Google's chips instead of paying Nvidia's premium prices.", why: "If Google's TPUs gain adoption as an alternative to Nvidia, Google creates revenue that simultaneously grows Google Cloud and weakens Nvidia's pricing power. Companies running AI on Google's TPUs are deeply integrated into Google's infrastructure — creating switching costs that lock them in." },
      { text: "DeepMind scientific breakthroughs creating new revenue categories", what: "DeepMind has solved protein folding and achieved gold-medal performance on math olympiad problems. New revenue categories means these breakthroughs translate into commercial products — drug discovery partnerships, climate modeling services, scientific computing platforms.", why: "If DeepMind's scientific AI becomes a commercial product, Google adds revenue streams disconnected from advertising or cloud — in healthcare, pharmaceuticals, energy, and materials science. These are trillion-dollar industries where AI could command enormous fees." },
    ],
    red: [
      { text: "Search market share dropping below 85% — the existential alarm bell", what: "If Google's share of global search queries drops below 85% — from its current 90%+ — it means a significant number of people are choosing AI alternatives like ChatGPT or Perplexity for their information needs.", why: "Google's entire $175 billion advertising business is built on people coming to Google to search. Below 85% search market share would directly translate to billions in lost advertising revenue. Once people form habits with AI search alternatives, they rarely switch back." },
      { text: "Perplexity or ChatGPT Search gaining meaningful search market share", what: "Perplexity AI and ChatGPT Search answer questions directly rather than showing lists of links. Meaningful market share gain means a measurable percentage of people — even 3-5% — are consistently choosing these tools over Google.", why: "Every 1% of search market share Google loses represents approximately $1.75 billion in annual revenue at risk. Younger users adopting AI search tools now may never develop the Google habit — creating a permanent demographic vulnerability." },
      { text: "Google Cloud growth decelerating while Azure accelerates", what: "If Google Cloud's growth rate falls while Microsoft Azure's accelerates, enterprises are choosing Microsoft over Google for AI cloud infrastructure at increasing rates — reversing the current dynamic where Google Cloud is growing faster.", why: "Google needs Google Cloud to succeed to diversify away from advertising dependence. If Google Cloud loses the AI cloud race while AI search threatens advertising, Google faces dual threats to both its major businesses simultaneously." },
      { text: "Gemini model quality falling behind GPT-5 or Claude on benchmarks", what: "AI models are regularly tested on standardized benchmarks measuring reasoning, coding, and language. If Gemini consistently scores below GPT-5 or Claude across major benchmarks, it signals Google's AI research is no longer setting the pace.", why: "Google invented the transformer architecture that powers all modern AI. Falling behind on model quality would be an extraordinary reversal. Enterprise customers choosing AI cloud providers are increasingly sensitive to model quality — falling behind could directly cost Google Cloud deals." },
      { text: "AI Overviews cannibalizing ad click-through rates faster than new formats emerge", what: "When AI Overviews answer questions directly, users get answers without clicking links — including the paid advertising links that generate Google's revenue. If click-through rates on ads decline as AI answers questions first, revenue per search query falls.", why: "This is Google's core existential dilemma — their best AI product directly undermines their best business. If click-through rates decline faster than Google can develop new AI-native advertising formats, Google faces structural revenue decline with no clear solution." },
      { text: "Regulatory antitrust action targeting search monopoly and AI integration", what: "Regulators in the US, EU, and UK are actively investigating whether Google uses its search monopoly to unfairly advantage its own AI products. Action could force Google to separate AI products from search or change Android AI distribution.", why: "Google's biggest AI advantage is distribution — being the default on Android and in Chrome. Regulatory action disrupting this distribution would fundamentally change Google's competitive position. The EU has already fined Google billions for anticompetitive behavior." },
    ],
  },
  NVIDIA: {
    green: [
      { text: "Data center revenue sustaining above $30B per quarter", what: "Nvidia's data center business — selling AI chips and systems to companies building AI infrastructure — generated $35 billion in a single quarter. Sustaining above $30 billion means demand for AI chips is not a temporary spike but a sustained structural shift.", why: "At $120+ billion annualized revenue from data center alone, Nvidia has built the fastest-growing large hardware business in history. Sustaining this level proves that AI infrastructure spending is a permanent feature of the global economy rather than a cyclical bubble." },
      { text: "Blackwell demand exceeding supply — backlog growing not shrinking", what: "Nvidia's Blackwell chips are so in demand that companies are ordering months in advance. A growing backlog means more orders are coming in than Nvidia can fulfill — companies have been known to ship Blackwell chips on private jets to expedite delivery.", why: "A growing backlog is the strongest possible signal of sustained demand. It means Nvidia's pricing power is intact — customers are willing to wait and pay premium prices because no alternative exists. A shrinking backlog signals cooling demand." },
      { text: "Automotive revenue accelerating toward and beyond $5B backlog", what: "Nvidia has a $5 billion backlog of automotive orders — signed contracts from car manufacturers for future chip deliveries. Accelerating beyond this means new orders are coming in faster than existing ones are fulfilled.", why: "Automotive is Nvidia's most important emerging revenue stream beyond data centers. If automotive revenue accelerates meaningfully, it proves Nvidia has successfully diversified — reducing dependence on the hyperscaler spending cycle." },
      { text: "Hyperscalers maintaining or increasing GPU capex guidance", what: "Hyperscalers are the four giant cloud companies — Microsoft, Google, Amazon, and Meta. GPU capex guidance is how much they plan to spend on AI chips. When they maintain or increase these plans publicly, they're committing to continued massive Nvidia chip purchases.", why: "Hyperscalers represent roughly 40% of Nvidia's data center revenue. Their capex guidance is the most reliable forward indicator of Nvidia's near-term revenue. All four maintaining or increasing AI spending plans simultaneously means Nvidia's revenue visibility is extremely strong." },
      { text: "New architecture maintaining 2-year generational lead over competitors", what: "Nvidia releases new chip generations roughly annually. A 2-year generational lead means competitors are always releasing chips that match what Nvidia had 2 years ago, while Nvidia is already 2 generations ahead. This performance gap determines who gets the orders.", why: "AI research labs buy the most powerful chips because AI model training time directly translates to competitive advantage. A sustained 2-year lead means there is no rational alternative to Nvidia for cutting-edge AI work — competitors exist but cannot serve the highest-performance tier." },
      { text: "Gross margins holding above 70% — pricing power fully intact", what: "Gross margin is the percentage of revenue left after the cost of making the chips. 70%+ means for every $100 of chips Nvidia sells, $70 is profit before operating expenses. This is a software-company level margin on hardware — extraordinarily rare.", why: "Software-like margins on hardware are the clearest signal that Nvidia's chips have no effective competition. Companies pay Nvidia's prices not because they want to but because they have no choice. The moment competitive alternatives emerge, margins compress." },
    ],
    red: [
      { text: "Any hyperscaler meaningfully cutting AI capex — demand signal collapses", what: "If Microsoft, Google, Amazon, or Meta announces it is significantly reducing AI infrastructure spending, Nvidia loses a major customer's orders. Even one hyperscaler cutting capex meaningfully would be a major demand signal.", why: "The entire bull case for Nvidia depends on hyperscalers continuing to spend hundreds of billions on AI infrastructure annually. Nvidia's stock fell 17% in a single day when DeepSeek showed AI could be trained more efficiently — cost efficiency directly reduces chip demand." },
      { text: "AMD gaining material market share above 10% in AI chips", what: "AMD makes competing AI chips — the MI300X series — that benchmark competitively with Nvidia's H100 on some tasks. Currently AMD has roughly 3-4% of the AI chip market. Crossing 10% would mean a meaningful number of companies are choosing AMD over Nvidia for real workloads.", why: "Nvidia's pricing power depends on having no viable alternative. The moment a competitor captures 10%+ market share it proves there IS a viable alternative — creating downward pressure on Nvidia's prices and margins even before AMD reaches full parity." },
      { text: "Custom silicon from Google/Amazon/Meta replacing Nvidia internally at scale", what: "Google, Amazon, and Meta are all building their own AI chips. If any of them publicly reports running the majority of their AI workloads on their own chips rather than Nvidia's at scale, it proves custom silicon can truly replace Nvidia.", why: "If Google's TPUs, Amazon's Trainium, or Meta's MTIA successfully power the majority of their own AI at meaningful scale, it demonstrates the blueprint for Nvidia replacement works — encouraging other large companies to attempt the same." },
      { text: "Export controls expanding to cover more chip variants — China revenue lost", what: "The US government has progressively restricted Nvidia's ability to sell advanced chips to Chinese companies. Each new round of restrictions forces Nvidia to create downgraded chip versions for China or exit that market segment entirely.", why: "China represented approximately 17% of Nvidia's data center revenue before major restrictions began. Each new export control round removes another slice of addressable market. Beyond direct revenue loss, it signals geopolitical risks that financial analysis cannot fully price." },
      { text: "Gross margin compression below 65% — competitive pricing pressure emerging", what: "If Nvidia's gross margins compress from 70%+ to below 65%, the company is either lowering prices to compete with alternatives or facing higher production costs. Either scenario indicates pricing power is weakening.", why: "Gross margin compression is the earliest financial signal that a competitive threat is real. Companies don't lower prices unless they have to. A sustained move below 65% would signal that AMD or custom silicon alternatives have become credible enough that Nvidia must compete on price." },
      { text: "Inference shift accelerating — custom ASICs capturing majority of inference market", what: "AI has two phases: training (teaching the model — very compute-intensive) and inference (the model answering questions — more repetitive). ASICs are custom chips optimized for specific tasks. If inference workloads shift to cheaper custom chips, Nvidia loses the fastest-growing segment.", why: "Nvidia currently dominates both training and inference. But inference workloads are more predictable and can run on cheaper specialized hardware. As AI products scale to billions of users, inference becomes the dominant cost. Losing inference to custom silicon significantly shrinks Nvidia's total addressable market." },
    ],
  },
  APPLE: {
    green: [
      { text: "iPhone upgrade cycle accelerating — AI features driving hardware sales", what: "iPhone upgrade cycle refers to how frequently people buy new iPhones. Apple Intelligence only works on iPhone 15 Pro and newer models. If people who have older iPhones are buying new ones specifically to access AI features, upgrade rates accelerate.", why: "iPhone upgrade cycles have been lengthening as each generation offered less compelling reasons to upgrade. AI features represent the most significant functional improvement since camera advances. Even modest upgrade cycle acceleration generates billions in additional revenue annually." },
      { text: "Services revenue growing above 15% consistently", what: "Apple Services includes the App Store, Apple Music, Apple TV+, iCloud, Apple Pay, and Apple Care. Growing above 15% consistently means people are spending more inside Apple's ecosystem — and AI apps paying Apple 30% commissions are contributing meaningfully.", why: "Services revenue is Apple's highest-margin business at 74% gross margins versus 37% for hardware. AI driving Services above 15% consistently proves Apple can monetize AI through its platform without building a competitive AI model." },
      { text: "Advanced Siri with deep app integration finally shipping on schedule", what: "The advanced version of Siri — capable of taking actions across all your apps, understanding personal context, and completing multi-step tasks — has been repeatedly delayed. Shipping on schedule means Apple delivered what it promised when it promised it.", why: "Apple has a reputation for shipping products that simply work. The Siri delays have damaged that reputation specifically around AI. Shipping advanced Siri on time would restore credibility and prove Apple's engineering can compete with the best AI products from Google and OpenAI." },
      { text: "Apple Watch health AI features creating meaningful new revenue streams", what: "Apple Watch already monitors heart rate, blood oxygen, sleep, and can detect irregular heartbeats. New health AI features would use continuous data to provide personalized health insights and early warning signs. Meaningful new revenue means people are paying for these features.", why: "Health AI is potentially Apple's most valuable long-term business because it's uniquely personal, creates genuine dependency, and commands premium pricing. People will pay significantly more for technology that might detect a health problem early." },
      { text: "Privacy positioning resonating as AI data concerns grow globally", what: "As AI becomes more personal — reading emails, tracking location, learning habits — public concern about data privacy is growing. Apple's on-device AI processing means personal data never leaves your phone. Privacy resonating means consumers are choosing Apple specifically because of this guarantee.", why: "Privacy is Apple's most defensible competitive advantage in AI because it requires 15 years of custom silicon investment to replicate. If privacy becomes a purchasing criterion at scale, Apple has a moat that Google and Meta fundamentally cannot match without abandoning their entire data-collection business models." },
      { text: "China market share stabilizing or recovering from Huawei pressure", what: "Huawei returned to the premium smartphone market with domestically made 5G chips, directly challenging iPhone in China. China represents about 17% of Apple's revenue. Stabilizing or recovering means Apple is holding its position against this competitive threat.", why: "Apple's China business faces simultaneous pressure from Huawei competition and the absence of Apple Intelligence features due to Chinese regulatory requirements. Stabilization would prove Apple's brand and ecosystem loyalty in China is durable enough to withstand a motivated local competitor." },
    ],
    red: [
      { text: "Advanced Siri delayed again — execution credibility collapses further", what: "The advanced Siri was promised for 2024, then 2025, then 2026. Each additional delay further erodes Apple's credibility on AI specifically. Apple's new AI chief came directly from Google's Gemini team — signaling how serious the problem is.", why: "Credibility is Apple's most important intangible asset. Repeated Siri delays create a narrative that Apple is meaningfully behind on AI. Once that narrative becomes entrenched it affects purchasing decisions, developer enthusiasm, and media coverage in ways that take years to reverse." },
      { text: "OpenAI partnership deepening — signals Apple cannot build competitive AI internally", what: "Apple currently partners with OpenAI to power the most capable Siri responses — handing off questions to ChatGPT when Siri can't answer. A deepening partnership means Apple relies more heavily on OpenAI rather than less.", why: "Apple has historically controlled every critical component of its products. Deepening dependency on a competitor's AI is fundamentally un-Apple. It signals Apple cannot close the AI capability gap internally — creating a strategic vulnerability if OpenAI changes partnership terms, gets acquired, or deteriorates." },
      { text: "China market share continuing to decline to Huawei", what: "If Huawei continues to take premium smartphone customers from Apple in China quarter after quarter, Apple's China revenue declines structurally.", why: "At 17% of total revenue, even a 30% decline in China business represents a 5% decline in total company revenue. More concerning is the signal: Apple's brand premium is not immune to a motivated, capable local competitor with government support." },
      { text: "Services growth decelerating — ecosystem stickiness weakening", what: "If App Store revenue, Apple Music subscriptions, iCloud upgrades, and other Services revenues grow more slowly than historical rates, it means people are spending less inside Apple's ecosystem.", why: "Services deceleration is a leading indicator of ecosystem health — the most important long-term metric for Apple. Apple's premium business model depends on people being so deeply integrated into the Apple ecosystem that switching is painful. If Services growth decelerates, that stickiness is weakening." },
      { text: "Samsung Galaxy AI features driving meaningful switching among younger users", what: "If younger users — teenagers and young adults forming their first smartphone habits — are choosing Samsung Galaxy over iPhone at meaningfully higher rates, citing AI features as a key factor, Apple has a generational problem.", why: "Younger users choosing Android now may not return to iPhone for a decade or ever. If Samsung Galaxy's Gemini AI integration is genuinely better than Siri for features young people care about most, Apple risks losing a generation of users at the exact moment when smartphone brand loyalty is formed." },
      { text: "Top AI talent continuing to leave for Google, Meta, and OpenAI", what: "Apple's culture of extreme secrecy has historically made it a less attractive destination for AI researchers who want to publish papers and collaborate openly. If top AI researchers consistently prefer Google, Meta, or OpenAI, Apple's internal AI capabilities develop more slowly.", why: "AI is a talent-driven field. The gap between teams with top researchers and teams without compounds over time. If Apple cannot compete for AI talent, the Siri gap to competitors will widen rather than close — making the delayed Siri recovery even harder to achieve." },
    ],
  },
  AMAZON: {
    green: [
      { text: "AWS revenue growth reaccelerating above 20%", what: "AWS — Amazon's cloud computing platform — went through a period of slower growth as companies optimized cloud spending. Reaccelerating above 20% means AI-driven demand is overcoming that optimization and driving a new growth cycle.", why: "AWS generates 70% of Amazon's operating profit despite being a fraction of total revenue. Revenue reaccelerating above 20% means AI is creating a genuine new demand wave. This growth rate at AWS's scale adds billions in new annual profit." },
      { text: "Trainium adoption growing among AWS customers — custom chip strategy working", what: "Amazon's Trainium chips are custom-designed alternatives to Nvidia GPUs. Growing adoption means AWS customers are choosing to run AI workloads on Amazon's own chips rather than paying the Nvidia premium.", why: "If Trainium gains meaningful adoption it proves Amazon can build chips competitive enough for real AI workloads. This validates a strategy that CEO Andy Jassy says will save tens of billions in capital expenditure at scale — fundamentally improving Amazon's cost structure." },
      { text: "Alexa+ subscriber numbers validating consumer AI monetization thesis", what: "Alexa+ is Amazon's rebuilt AI assistant at $19.99 per month subscription. Subscriber numbers that are disclosed and growing validate that people on Amazon's 500 million existing Alexa-enabled devices are willing to pay monthly for significantly improved AI.", why: "Amazon has 500 million Alexa devices deployed globally. Strong Alexa+ subscriber numbers would prove Amazon's strategy of embedding AI into existing hardware works commercially — creating a recurring revenue stream from the consumer hardware business." },
      { text: "Amazon Q enterprise adoption competing directly with Microsoft Copilot", what: "Amazon Q is an AI assistant for businesses that connects to a company's internal documents, databases, code, and systems to answer questions and complete tasks.", why: "Every AWS enterprise customer is a potential Amazon Q customer. If Amazon Q gains traction, it creates significant new revenue and deepens customer lock-in to the AWS ecosystem — proving Amazon can compete in AI software, not just AI infrastructure." },
      { text: "Advertising revenue sustaining above 15% growth", what: "Amazon's advertising business — primarily sponsored products in search results and display ads — generates over $56 billion annually. Growing above 15% means advertisers are increasingly choosing Amazon's platform, driven by AI improvements in ad targeting.", why: "Amazon advertising is the highest-margin business in the company. AI improving ad targeting creates a compounding advantage — better targeting means better advertiser results means higher prices Amazon can charge — similar to Meta's dynamic but in a purchase-intent environment." },
      { text: "Robotics and logistics cost reduction showing up in improving retail margins", what: "Amazon operates over 1 million robots in its warehouses coordinated by AI. If AI-driven efficiencies translate into measurable improvements in retail gross margins, it proves AI is generating real operational savings.", why: "Amazon's retail business operates on razor-thin margins. AI-driven logistics efficiency can structurally improve retail margins without raising prices. Even a 1 percentage point improvement across Amazon's $350+ billion retail revenue base is worth billions annually." },
    ],
    red: [
      { text: "AWS growth decelerating while Azure and Google Cloud accelerate", what: "If AWS revenue growth falls while Microsoft Azure and Google Cloud grow faster, enterprises are choosing competitors for their AI cloud needs at increasing rates — an unusual and alarming reversal for the market leader.", why: "AWS's market leadership has been considered one of the most durable competitive positions in technology. If both Azure and Google Cloud simultaneously outgrow AWS on an AI-driven wave, it signals AWS's AI offerings are less compelling — a direct threat to the business generating 70% of Amazon's operating profit." },
      { text: "Alexa+ adoption disappointing — consumer AI reinvention failing", what: "If Alexa+ subscriber counts are low, growth is slow, or Amazon stops disclosing numbers after the initial launch, the consumer AI reinvention isn't working. People with Alexa devices aren't valuing the improved AI enough to pay $19.99 monthly.", why: "Amazon spent years and hundreds of millions developing Alexa only to watch it become irrelevant compared to ChatGPT. A failed Alexa+ launch would mean Amazon has no compelling consumer AI product — leaving 500 million deployed devices as hardware without a competitive AI service." },
      { text: "Trainium quality issues or customer rejection — custom chip strategy stalling", what: "If AWS customers try Trainium and return to Nvidia chips because of performance problems, software compatibility issues, or reliability concerns, Amazon's custom chip strategy fails to gain traction.", why: "The custom chip strategy is central to Amazon's plan to reduce costs. A failed chip strategy means Amazon continues paying Nvidia's premium prices indefinitely — maintaining a structural cost disadvantage against competitors who successfully reduce chip costs." },
      { text: "Microsoft or Google winning significant AWS customer defections", what: "Customer defection means companies that currently run infrastructure on AWS switching to Microsoft Azure or Google Cloud. Significant defections means enough customers moving that it shows up in AWS growth numbers as a structural headwind.", why: "AWS has benefited from extraordinary customer stickiness — moving cloud infrastructure is enormously expensive and disruptive. Significant defections would signal the pain of switching is worth it to access better AI services elsewhere — an extraordinary statement about how far AWS's AI offerings have fallen behind." },
      { text: "Healthcare AI ambitions hitting regulatory walls", what: "Amazon's healthcare AI vision — combining One Medical clinical data, Amazon Pharmacy prescription data, and consumer purchasing behavior — faces stringent FDA and HIPAA regulations. Regulatory walls means regulators block how Amazon can use health data for AI.", why: "Healthcare is where Amazon's data advantage could be most valuable — and most regulated. If regulatory constraints prevent Amazon from combining health data sources, the billions spent on One Medical and Amazon Pharmacy acquisitions cannot generate the planned AI returns." },
      { text: "Andy Jassy departure — key man risk at critical AI juncture", what: "Andy Jassy built AWS from scratch and now runs all of Amazon. His deep understanding of cloud infrastructure has driven Amazon's AI strategy. A departure at this critical moment would remove the architect of Amazon's current direction.", why: "Amazon is at an inflection point in AI — Trainium, Alexa+, Amazon Q, and healthcare AI are all in early stages requiring sustained strategic commitment. A CEO transition during this period creates strategic uncertainty and reduced decision-making speed when competitive dynamics are moving fastest." },
    ],
  },
  TESLA: {
    green: [
      { text: "FSD achieving genuinely unsupervised autonomous operation at scale", what: "Full Self-Driving that is genuinely unsupervised means a Tesla can complete a journey from start to finish without the driver needing to watch the road or intervene. At scale means this works reliably across millions of miles in diverse real-world conditions.", why: "This single achievement would transform Tesla's entire business model. A car that drives itself autonomously can function as a robotaxi generating revenue around the clock. Tesla management projects 70%+ gross margins on robotaxi revenue — compared to roughly 13-17% on car sales." },
      { text: "Cybercab robotaxi expanding successfully beyond Austin to multiple cities", what: "Tesla launched limited Cybercab robotaxi service in Austin, Texas. Expanding to multiple cities means Tesla has obtained regulatory approval in additional jurisdictions and demonstrated sufficient safety records to manage fleets of driverless vehicles.", why: "Moving from one city to multiple cities transforms a pilot into a business. Waymo — Tesla's most credible robotaxi competitor — operates in 10 cities with 400,000 paid rides per week. Tesla demonstrating meaningful multi-city operations would prove their vision-only approach works at scale." },
      { text: "Optimus achieving meaningful factory deployment at Tesla facilities", what: "Optimus is Tesla's humanoid robot. Meaningful factory deployment means Optimus robots are performing real production tasks at Tesla manufacturing facilities — not just demonstrations, but actual work that improves manufacturing efficiency.", why: "Every Optimus robot successfully deployed in Tesla's own factories is proof of concept for the $20,000-30,000 commercial product Tesla plans to sell externally. If Optimus can reliably perform manufacturing tasks at Tesla's high-standard facilities, it validates the technology for commercial sale." },
      { text: "Energy business sustaining above 50% growth consistently", what: "Tesla's Energy division sells Megapack grid-scale batteries and Powerwall home batteries. 50%+ growth means the business is consistently expanding, driven by global demand for energy storage as renewable energy adoption accelerates.", why: "Energy is Tesla's most financially healthy and most underappreciated business. It already generates 24%+ gross margins — better than the car business — and doesn't depend on Musk's brand, autonomous driving, or any unproven innovation. 50%+ sustained growth makes this business worth hundreds of billions on its own." },
      { text: "Brand sentiment stabilizing particularly in European markets", what: "Tesla's European sales dropped over 40% in early 2025 amid consumer boycotts linked to Elon Musk's political activities. Stabilizing brand sentiment means the boycott effects are plateauing or reversing — European consumers are again considering Teslas on their merits.", why: "Europe is Tesla's second-largest market. Brand sentiment stabilizing means the political damage is containable rather than permanent — preserving Tesla's European revenue base. Without European market recovery, Tesla's global growth story faces a structural headwind that technology improvements alone cannot overcome." },
      { text: "Dojo demonstrating cost advantages over Nvidia GPU clusters", what: "Dojo is Tesla's custom-designed AI supercomputer built specifically to train neural networks on driving video data. Demonstrating cost advantages means Dojo processes Tesla's AI training workloads at meaningfully lower cost than equivalent Nvidia GPU clusters.", why: "If Dojo achieves genuine cost advantages, Tesla reduces dependence on Nvidia chips and lowers the cost of improving its autonomous driving AI over time. Cheaper AI training means faster improvement cycles means better FSD means more robotaxi revenue — a compounding advantage." },
    ],
    red: [
      { text: "Delivery volume declining for multiple consecutive quarters", what: "Tesla reports vehicle deliveries every quarter. Declining deliveries for multiple consecutive quarters means Tesla is selling fewer cars over a sustained period — not just experiencing a one-quarter supply disruption.", why: "Multiple consecutive quarters of delivery decline signals structural demand problems. This could reflect brand damage, an aging product lineup, intensifying competition from BYD, or all three simultaneously. Sustained delivery declines would force Tesla to choose between cutting prices or accepting lower volume." },
      { text: "FSD safety incidents attracting serious regulatory action", what: "A serious FSD safety incident means a Tesla operating in autonomous or semi-autonomous mode is involved in a significant accident that attracts formal investigation by regulators. Serious action could include mandatory software recalls or suspension of FSD testing.", why: "FSD safety incidents are Tesla's most catastrophic near-term risk. A single high-profile fatal accident involving FSD could trigger regulatory responses that effectively halt the entire autonomous driving program — the same program that underpins Tesla's entire robotaxi business before it has a chance to scale." },
      { text: "BYD entering US market aggressively if tariffs shift", what: "BYD is China's largest EV manufacturer and has already surpassed Tesla in global EV sales. Currently US tariffs of 100% on Chinese vehicles effectively prevent BYD from competing in America. If tariff policy shifts, BYD could enter the US market with vehicles offering comparable technology at significantly lower prices.", why: "BYD produces EVs at cost structures Tesla cannot match. In every market where BYD and Tesla compete without trade barriers, BYD has gained significant share. The US market is Tesla's home turf and most profitable market — a BYD entrance would create the most dangerous competitive dynamic Tesla has ever faced." },
      { text: "Brand damage accelerating among core demographic", what: "Tesla's core buyer demographic has historically been affluent, educated, environmentally conscious, and technologically progressive consumers. Brand damage accelerating means this group is actively avoiding Tesla at increasing rates — citing Elon Musk's political activities as the reason.", why: "Brand damage among the core demographic is uniquely dangerous because these are the customers Tesla most needs — premium buyers willing to pay for innovation. Losing them to competitors like Rivian or BMW iX while facing BYD's cost competition creates a pincer movement eliminating both Tesla's premium positioning and volume potential." },
      { text: "Elon Musk's attention further divided across SpaceX, xAI, X, DOGE, Neuralink", what: "Elon Musk simultaneously runs or is deeply involved with Tesla, SpaceX, xAI, X, Neuralink, and served in a US government advisory role. If his involvement in these other entities continues growing while Tesla faces existential competitive and brand challenges, his attention deficit becomes a company crisis.", why: "Tesla's most critical strategic decisions — FSD timelines, Optimus deployment, Cybercab expansion, brand recovery in Europe — all require focused CEO attention. The 2022-2025 Tesla delivery decline correlated directly with the period of Musk's maximum political distraction." },
      { text: "Robotaxi regulatory rejections in major markets — timeline collapses", what: "Regulatory approval is required for every city where Tesla wants to operate Cybercab without a human driver. Rejections in major markets — New York, Los Angeles, London, Berlin — mean Tesla cannot deploy robotaxis in the most economically valuable urban markets.", why: "The entire financial case for Tesla's current $1.1 trillion valuation depends heavily on a successful robotaxi business generating software-like margins at massive scale. If regulators in major markets reject Cybercab deployment, the robotaxi revenue opportunity shrinks dramatically — forcing a fundamental reassessment of what Tesla is actually worth as primarily a car company." },
    ],
  },
};

// ─── COMPANY DATA ─────────────────────────────────────────────────────────────
const COMPANIES = {
  META: {
    id: "META", name: "Meta", color: "#4F8EF7", logo: "M",
    tagline: "Social media empire betting on consumer AI dominance",
    marketCap: "$1.5T", aiSpend: "$145B/yr", revenue: "$56B/qtr",
    risk: 6, riskLabel: "Fairly Risky",
    what: "The world's largest social network turned AI platform. Facebook, Instagram, WhatsApp — 3.56 billion daily users — becoming the delivery vehicle for Meta AI.",
    primaryAI: "Meta AI + Llama (open source)",
    threat: "Google — the only competitor matching Meta's consumer distribution. Android has 3B devices. If Gemini becomes the default AI assistant before Meta AI establishes habit, Meta loses the consumer AI race.",
    goals: [
      { text: "Make AI-powered ads command premium pricing from advertisers", ambition: 4, likelihood: 5, what: "Meta's main business is selling ads on Facebook and Instagram. AI helps them figure out exactly which ad to show which person at which moment — making those ads so effective that businesses are willing to pay more for them.", why: "Every dollar improvement in ad targeting goes directly to Meta's bottom line. Better AI means businesses pay more per ad, and Meta keeps all that extra revenue.", status: "Already working. Meta's revenue grew 33% in the most recent quarter — the fastest growth since 2021. AI-improved ad targeting is the primary driver." },
      { text: "Become the dominant everyday consumer AI assistant via social platforms", ambition: 5, likelihood: 3, what: "Mark Zuckerberg wants Meta AI to be the AI assistant billions of people use daily — not through a separate app, but built directly into Instagram, WhatsApp, and Facebook that people already open dozens of times a day.", why: "Whoever becomes the default AI assistant for everyday people wins the biggest prize in tech. Meta's advantage is that they don't need to convince anyone to download something new — they already have 3.56 billion daily users.", status: "Early but real. Meta AI is live inside Instagram and WhatsApp globally. Engagement metrics are growing but Meta hasn't disclosed how many people actively use it versus passively ignoring it." },
      { text: "Monetize AI directly through premium subscriptions (Manus, Vibes)", ambition: 4, likelihood: 3, what: "Meta is building paid subscription tiers that unlock more powerful AI features — like Manus, an autonomous AI agent that can plan trips, do research, and complete complex tasks on your behalf.", why: "Right now Meta's AI revenue is entirely indirect — AI makes ads better, ads generate revenue. A subscription model creates a direct line between AI and revenue, which is what Wall Street wants to see.", status: "Testing phase as of early 2026. Premium subscriptions are being tested in select markets. No major revenue from this yet, but the infrastructure is being built." },
      { text: "Make Llama the global open-source AI standard", ambition: 5, likelihood: 4, what: "Llama is Meta's AI model — and unlike competitors who keep their AI private, Meta gives Llama away completely free. The goal is for Llama to become the foundation the entire world's AI industry builds on top of.", why: "If every developer in the world builds on Llama, Meta gains enormous influence over AI's direction without charging a dollar. Google did the same thing with Android — gave it away free, and now controls the mobile ecosystem.", status: "Working remarkably well. Llama 3 is one of the most downloaded AI models in the world. Amazon, Microsoft, and thousands of startups are building on it. Meta is winning the open-source AI race decisively." },
      { text: "Own the AI hardware interface through Ray-Ban and AR glasses", ambition: 5, likelihood: 2, what: "Meta is betting that AI will eventually move off phone screens and onto your face. Ray-Ban Meta glasses already have a built-in AI assistant. The long-term vision is full augmented reality glasses that overlay AI information onto the real world.", why: "Whoever owns the hardware people use to interact with AI controls the entire experience. If Meta's glasses become as common as AirPods, every AI interaction in the physical world goes through Meta.", status: "Ray-Ban Meta glasses are selling well and have genuine early traction. But full AR glasses remain years away from consumer readiness. This is the longest-term and most uncertain goal on Meta's list." },
    ],
    radar: { model: 4, distribution: 5, data: 4, hardware: 2, monetization: 3, research: 3 },
  },
  MSFT: {
    id: "MSFT", name: "Microsoft", color: "#38BDF8", logo: "Ms",
    tagline: "The enterprise AI landlord collecting tolls from corporate America",
    marketCap: "$2.9T", aiSpend: "$190B/yr", revenue: "$82B/qtr",
    risk: 5, riskLabel: "Moderate Risk",
    what: "Enterprise software giant that made a $13B bet on OpenAI — embedding the result into Office, Teams, and Azure to become the AI infrastructure layer for corporate America.",
    primaryAI: "Microsoft Copilot + Azure AI (OpenAI-powered)",
    threat: "OpenAI itself. Microsoft's AI advantage is built on a partner it doesn't fully control. If OpenAI's models fall behind, it builds its own cloud, or the relationship fractures — Microsoft's moat narrows dramatically overnight.",
    goals: [
      { text: "Make Azure the dominant AI cloud infrastructure for enterprises", ambition: 5, likelihood: 4, what: "Azure is Microsoft's cloud computing platform — essentially a massive rental service for computer power. Every company that wants to run AI needs enormous computing power. Microsoft's goal is to be the place those companies rent that power from.", why: "Cloud computing is like electricity for AI — nobody builds their own power plant, they just pay for the electricity they use. If Microsoft becomes the AI cloud of choice for businesses, every AI dollar spent flows partly to Azure.", status: "Strong. Azure grew 40% in the most recent quarter driven by AI demand. The OpenAI partnership gives Azure a unique advantage — companies wanting GPT-4 in their products must go through Azure." },
      { text: "Monetize Copilot across 400M+ Microsoft 365 enterprise users", ambition: 5, likelihood: 4, what: "Microsoft Copilot is AI built directly into Word, Excel, PowerPoint, Outlook, and Teams. It costs businesses an extra $30 per employee per month on top of their existing Microsoft subscription.", why: "Microsoft already has over 400 million people paying for Microsoft 365. If even 10% upgrade to Copilot at $30/month that's $14 billion in new annual revenue from a product that didn't exist two years ago.", status: "Growing but slower than hoped. Large enterprises are adopting it but individual employees often don't use it consistently. The gap between companies buying licenses and employees actively using the product is Microsoft's biggest near-term challenge." },
      { text: "Dominate developer AI through GitHub Copilot", ambition: 4, likelihood: 5, what: "GitHub is where the world's software developers store and manage their code. GitHub Copilot is an AI that writes code alongside developers in real time. It costs $10-19 per developer per month.", why: "There are 100 million software developers globally. Winning the AI tool they use every day is enormously valuable — both for direct subscription revenue and because developers who love GitHub Copilot push their companies toward other Microsoft AI products.", status: "Already the most widely adopted AI developer tool in the world. This goal is largely achieved — GitHub Copilot has millions of paying subscribers and adoption is accelerating rapidly." },
      { text: "Maintain consumer AI relevance through Bing and Edge", ambition: 3, likelihood: 2, what: "Microsoft embedded ChatGPT into Bing search and the Edge browser to make them competitive with Google Search. The goal is to use AI to win back search market share — an area where Microsoft has been a distant second to Google for 20 years.", why: "Search advertising is a massive market. Even gaining a few percentage points of search market share from Google would be worth billions.", status: "Minimal impact so far. Bing's market share has increased slightly but Google's dominance remains overwhelming at 90%+. This is Microsoft's weakest goal." },
      { text: "Compound OpenAI partnership into insurmountable enterprise moat", ambition: 5, likelihood: 3, what: "Microsoft invested $13 billion in OpenAI and got exclusive rights to deploy OpenAI's models through Azure. The goal is to use this head start to build relationships and integrations so deep that enterprises can't easily switch to a competitor.", why: "Enterprise software relationships are extraordinarily sticky. If Microsoft can get companies fully integrated into Copilot across Word, Excel, Teams, and Azure — the switching cost becomes enormous.", status: "Mixed. The OpenAI partnership is powerful but Microsoft doesn't control OpenAI. 45% of Microsoft's future cloud revenue backlog is tied to OpenAI alone — a dangerous concentration risk." },
    ],
    radar: { model: 4, distribution: 4, data: 3, hardware: 2, monetization: 5, research: 3 },
  },
  GOOGLE: {
    id: "GOOGLE", name: "Google", color: "#F97316", logo: "G",
    tagline: "Most diversified AI stack — and the most at war with itself",
    marketCap: "$2.1T", aiSpend: "$75B/yr", revenue: "$90B/qtr",
    risk: 5, riskLabel: "Moderate Risk",
    what: "Invented the transformer architecture that powers all modern AI — then couldn't deploy it without threatening its $175B search business. Now racing to transform search before competitors do it for them.",
    primaryAI: "Gemini + Google Cloud AI + TPUs + DeepMind",
    threat: "AI search cannibalization of their own product. Every AI Overview that fully answers a question means one fewer ad click — threatening $175B in annual revenue. Their primary AI goal and existential threat are the exact same thing.",
    goals: [
      { text: "Transform search into an AI answer engine without losing ad revenue", ambition: 5, likelihood: 3, what: "Google Search currently shows you a list of links. AI Overviews now appear at the top — AI-generated answers that directly answer your question. Google is trying to transform from a link directory into an AI answer machine.", why: "This is Google's existential challenge. Search advertising generates $175 billion a year. If AI gives you the answer directly, you don't click the ads. Google has to rebuild their entire revenue model while simultaneously protecting it.", status: "Complicated. AI Overviews are live globally and search market share remains above 90%. But click-through rates on ads are declining as AI answers questions directly. Google is racing to develop new AI-native ad formats." },
      { text: "Make Google Cloud the enterprise AI alternative to Azure", ambition: 5, likelihood: 4, what: "Google Cloud is Google's rental computing platform — the same infrastructure that runs Google Search and YouTube, now available for other companies. Google's goal is to position this as the best place for companies to run their AI.", why: "Enterprise cloud is the biggest recurring revenue opportunity in tech. Google Cloud is currently third behind Amazon AWS and Microsoft Azure. But Google's AI research leadership through DeepMind gives it a genuine technical edge.", status: "Accelerating fast. Google Cloud grew 63% in the most recent quarter — faster than both AWS and Azure. Major deals with Meta, OpenAI, and Anthropic to run AI workloads on Google's TPU chips validate the technology." },
      { text: "Dominate consumer AI through Android's 3B device distribution", ambition: 5, likelihood: 4, what: "Android is the operating system on 3 billion smartphones. Google is embedding Gemini directly into Android as the default AI assistant. The goal is that every Android user automatically has access to Gemini without downloading anything.", why: "Distribution is everything in consumer tech. Google's Android advantage means Gemini has instant global reach that ChatGPT has to spend billions to acquire.", status: "Rolling out. Gemini is now the default assistant on new Android devices in most markets. The Circle to Search feature has been well-received and demonstrates the power of OS-level AI integration." },
      { text: "Own enterprise productivity through Google Workspace + Gemini", ambition: 4, likelihood: 4, what: "Google Workspace is Google's suite of business tools — Docs, Sheets, Gmail, Meet, Drive. Gemini embedded in Workspace does what Microsoft Copilot does in Office — writes your emails, summarizes meetings, analyzes spreadsheets.", why: "Hundreds of millions of people use Google Workspace daily for work. If Google can charge $20-30 per user per month for AI features the way Microsoft does with Copilot, the revenue opportunity is enormous.", status: "Live and growing. Gemini for Workspace is available at additional cost and enterprise adoption is increasing. Google is winning some deals from Microsoft 365 where companies prefer to stay within the Google ecosystem." },
      { text: "Maintain AI research supremacy through DeepMind", ambition: 5, likelihood: 5, what: "Google DeepMind is widely considered the most accomplished AI research organization in the world. AlphaFold solved protein folding — a problem biologists couldn't crack for 50 years. The goal is to keep making breakthroughs that define what AI can do.", why: "Research leadership today becomes product advantage tomorrow. The best AI researchers want to work where the most interesting problems are being solved — and that's still DeepMind.", status: "Dominant. DeepMind AlphaFold has been used in 1.8 million research projects globally. AlphaGeometry solved International Math Olympiad problems at gold medal level. No other research organization is operating at this level consistently." },
      { text: "Own the AI chip layer through TPUs — reduce Nvidia dependency", ambition: 4, likelihood: 4, what: "TPUs are Google's custom-designed AI chips built specifically to run AI calculations efficiently. Google uses them to run virtually all of their own AI — including training Gemini. They're also making TPUs available to other companies through Google Cloud.", why: "Nvidia charges a premium for its AI chips. Google's TPUs are already proven — Gemini was trained entirely on TPUs. Every dollar Google doesn't spend on Nvidia chips is a dollar of competitive cost advantage.", status: "Ahead of all competitors. TPU v7 Ironwood delivers 100% better performance per watt than its predecessor. OpenAI, Meta, and Anthropic are all using Google's TPUs for some AI workloads — meaning Google's chips are becoming an industry standard beyond just Google itself." },
    ],
    radar: { model: 5, distribution: 5, data: 5, hardware: 4, monetization: 4, research: 5 },
  },
  NVIDIA: {
    id: "NVIDIA", name: "Nvidia", color: "#4ADE80", logo: "N",
    tagline: "The toll road of the AI economy — everything runs on their chips",
    marketCap: "$2.7T", aiSpend: "N/A", revenue: "$35B/qtr",
    risk: 6, riskLabel: "Fairly Risky",
    what: "Designs the GPUs that train every major AI model on earth. Protected by CUDA — a software ecosystem 15 years and 4 million developers deep that makes switching to any competitor extraordinarily painful.",
    primaryAI: "H100/H200/Blackwell GPUs + CUDA + NVLink + Mellanox networking",
    threat: "Its own customers. Microsoft, Google, Amazon, and Meta — the four largest Nvidia customers — are simultaneously the four companies with the most resources and motivation to build alternatives. They need Nvidia now but are actively funding its replacement.",
    goals: [
      { text: "Maintain AI training chip dominance through continuous architecture leadership", ambition: 5, likelihood: 4, what: "Nvidia releases new chip generations roughly every year — each one significantly more powerful than the last. Nvidia's goal is to keep that lead permanent by moving faster than anyone can catch up.", why: "AI companies race to build the most powerful AI models. More powerful chips equal faster AI development. As long as Nvidia's chips are the fastest, every serious AI lab in the world has to buy them — regardless of price.", status: "Currently dominant. The Blackwell GB200 chips are sold out for months in advance. Data center revenue hit $35 billion in a single quarter. No competitor is within 2 generations of matching Nvidia's performance on AI training workloads." },
      { text: "Expand from chips to complete AI infrastructure systems (GB200 NVL72 rack)", ambition: 5, likelihood: 4, what: "Instead of selling individual chips, Nvidia now sells complete AI supercomputer systems in a rack — the GB200 NVL72. It contains 72 GPUs connected together, 120 terabytes of memory, and costs roughly $3 million. It's an entire AI factory in a box.", why: "Selling complete systems instead of individual chips dramatically increases the revenue per customer. The switching cost is also much higher — you don't just swap out a system you built your entire infrastructure around.", status: "Shipping to major hyperscalers now. Microsoft, Google, Amazon, and Meta are all deploying NVL72 racks at scale. This strategy is working — Nvidia's average selling price per customer is rising faster than unit volume." },
      { text: "Own the networking layer through Mellanox/InfiniBand", ambition: 4, likelihood: 4, what: "When you connect thousands of AI chips together into a massive cluster, they need to communicate at extraordinary speeds. Nvidia acquired Mellanox in 2020, giving them the networking technology that connects GPU clusters. Like owning both the cars and the roads they drive on.", why: "Custom AI chips from Google, Amazon, and Meta might eventually compete with Nvidia GPUs on raw performance. But those chips still need networking infrastructure — and Nvidia owns the best networking technology in the world.", status: "Growing fast. Networking revenue is accelerating as AI clusters get larger. This is Nvidia's most underappreciated revenue stream and their best defense against custom chip competition." },
      { text: "Capture the automotive AI market through DRIVE platform", ambition: 4, likelihood: 3, what: "Nvidia DRIVE is an AI computing platform for autonomous vehicles. Tesla, Mercedes, BYD, Toyota, and dozens of other manufacturers use Nvidia's chips and software to power their self-driving features.", why: "There are roughly 90 million new cars sold globally every year. If AI becomes standard in vehicles — which is inevitable — the automotive chip market becomes enormous. Nvidia's $5 billion automotive backlog suggests they've already locked in significant future revenue.", status: "Early but growing fast. Automotive revenue grew 103% year over year. The $5 billion backlog represents signed contracts for future delivery. Still a small fraction of total revenue but growing toward becoming a major business." },
      { text: "Dominate robotics AI through Isaac platform", ambition: 5, likelihood: 3, what: "Nvidia Isaac is an AI platform for physical robots — giving them the AI intelligence to see, understand, and interact with the real world. The same neural networks that teach a car to drive can teach a robot to work in a factory.", why: "If humanoid robots and industrial robots become mainstream — which both Tesla and dozens of other companies are working toward — every robot needs an AI processor. Nvidia wants to own that market the way they own the AI training market.", status: "Very early. The technology is real and Nvidia has partnered with major robotics companies. But commercial-scale robot deployment is still years away from mainstream. This is Nvidia's longest-term and most speculative bet." },
      { text: "Deepen CUDA moat through CUDA-X domain-specific AI libraries", ambition: 4, likelihood: 5, what: "CUDA is the programming language developers use to write code that runs on Nvidia GPUs. CUDA-X extends this with pre-built AI tools for specific industries — healthcare AI, climate modeling, financial analysis, autonomous vehicles.", why: "4 million developers have built their work on CUDA over 15 years. Switching to a competitor's chip means rewriting all that code from scratch. By adding more specialized tools, Nvidia makes the ecosystem so comprehensive that the switching cost becomes virtually prohibitive.", status: "Continuously expanding. This is the most defensible part of Nvidia's entire business. Even when competitors release faster chips, the CUDA ecosystem keeps customers on Nvidia. This moat strengthens every year regardless of hardware competition." },
    ],
    radar: { model: 3, distribution: 3, data: 3, hardware: 5, monetization: 5, research: 4 },
  },
  APPLE: {
    id: "APPLE", name: "Apple", color: "#C084FC", logo: "A",
    tagline: "The patient giant with 2.35B devices and a Siri problem",
    marketCap: "$3.5T", aiSpend: "N/A", revenue: "$124B/qtr",
    risk: 4, riskLabel: "Lower Risk",
    what: "The world's most valuable company playing a different AI game — owning the hardware layer, controlling the platform, and partnering pragmatically with OpenAI while betting privacy becomes AI's most valuable differentiator.",
    primaryAI: "Apple Intelligence + Siri (rebuilding) + ChatGPT partnership + Neural Engine",
    threat: "The iPhone becoming commoditized by AI. If Samsung delivers a dramatically superior AI experience through Gemini while Siri remains a punchline, the justification for Apple's premium price weakens for the first time in modern history.",
    goals: [
      { text: "Rebuild Siri into a genuinely capable AI assistant with deep app integration", ambition: 5, likelihood: 3, what: "Siri launched in 2011 as the first mainstream AI voice assistant but fell dramatically behind ChatGPT, Gemini, and others. Apple is completely rebuilding Siri — not just making it smarter at answering questions but giving it the ability to take actions across all your apps.", why: "The AI assistant is becoming the primary way people interact with their phone. If Siri remains a punchline while Samsung's Gemini integration does things Siri can't, people — especially younger users — will switch to Android.", status: "Significantly delayed. The advanced Siri was promised for 2024, delayed to 2025, delayed again to 2026. Apple hired Google's Gemini engineering lead to fix it. The delays are Apple's single biggest execution risk." },
      { text: "Make privacy-first on-device AI a premium differentiator", ambition: 4, likelihood: 4, what: "Apple processes AI directly on your device — your iPhone's chip handles AI requests without sending personal data to any server. When you ask Siri something sensitive, it stays on your phone.", why: "As AI becomes more personal — reading emails, knowing location, understanding habits — privacy becomes increasingly valuable. Apple is betting consumers will pay a premium for a private alternative. This is a genuine differentiator no competitor can easily replicate.", status: "Live and working. Apple Intelligence is available on iPhone 15 Pro and newer. The privacy architecture is technically sound and validated by independent security researchers." },
      { text: "Drive iPhone upgrade cycle through Apple Intelligence features", ambition: 4, likelihood: 3, what: "Apple Intelligence only works on iPhone 15 Pro and newer — excluding hundreds of millions of older iPhones. This is strategic: people who want AI features have to buy a new phone.", why: "iPhone upgrade cycles have been lengthening. If AI features are compelling enough, people upgrade sooner. Even modest acceleration in upgrade timing across Apple's billion+ iPhone user base generates billions in additional revenue.", status: "Unclear so far. iPhone sales haven't shown a dramatic AI-driven upgrade surge yet. The advanced Siri delays mean the most compelling AI features aren't available — making it hard to judge whether the upgrade thesis will work." },
      { text: "Monetize AI through App Store 30% cut on all AI app subscriptions", ambition: 3, likelihood: 5, what: "Every AI app on iPhone — ChatGPT, Claude, Gemini, Perplexity — pays Apple a 30% cut of any subscription revenue generated through the App Store. Apple doesn't need to win the AI race to profit from it. They collect a toll on every AI dollar flowing through their platform.", why: "This is Apple's smartest AI play and requires no execution risk. Whether OpenAI or Google wins the AI race, Apple gets 30%. ChatGPT alone generates hundreds of millions in iOS subscription revenue annually.", status: "Already generating significant revenue. This is the most de-risked goal on Apple's list. As long as AI apps are popular on iPhone and processed through the App Store, Apple collects its toll regardless of which AI company wins." },
      { text: "Own the AI wearable layer through Apple Watch health AI and AirPods", ambition: 4, likelihood: 3, what: "Apple Watch continuously monitors your heart rate, blood oxygen, ECG, temperature, sleep, and movement. AI applied to this continuous health data could predict health problems before you feel symptoms.", why: "Health AI is one of the most valuable AI applications imaginable — people will pay for something that might save their life. Apple is the only company with both the trusted consumer hardware on 100 million wrists and the medical credibility to make health AI mainstream.", status: "Incremental progress. Apple Watch already detects irregular heartbeats and has called ambulances during accidents. But transformative AI health applications are still in development. The regulatory path through the FDA is complex and slow." },
    ],
    radar: { model: 2, distribution: 5, data: 3, hardware: 5, monetization: 4, research: 2 },
  },
  AMAZON: {
    id: "AMAZON", name: "Amazon", color: "#FBBF24", logo: "Am",
    tagline: "The quiet AI giant — collecting tolls while building the future",
    marketCap: "$2.3T", aiSpend: "$100B+/yr", revenue: "$187B/qtr",
    risk: 4, riskLabel: "Lower Risk",
    what: "Three businesses in one: retail (everyone knows), AWS (funds everything at 70% of profits), and advertising (the hidden $56B giant). All three being transformed by AI simultaneously.",
    primaryAI: "AWS Bedrock + Trainium chips + Alexa+ + Amazon Q + 1M+ warehouse robots",
    threat: "Microsoft Azure's enterprise relationships. Amazon built AWS on self-service developers. Microsoft built Azure on C-suite relationships locked in for decades. As AI becomes a boardroom decision, relationship depth beats technical superiority.",
    goals: [
      { text: "Make AWS the dominant AI cloud with more services than any competitor", ambition: 5, likelihood: 4, what: "AWS is Amazon's cloud computing platform — the largest in the world. Companies rent Amazon's computers to run their applications and now increasingly to run their AI. AWS offers over 50 purpose-built AI services — more than any competitor.", why: "Cloud computing is the infrastructure layer of the entire economy. Being the largest cloud provider means Amazon collects revenue from virtually every industry's AI adoption. AWS generates 70% of Amazon's profits despite being a fraction of total revenue.", status: "Strong position being challenged. AWS is still the largest cloud provider but Microsoft Azure and Google Cloud are growing faster. Amazon's Bedrock strategy — offering multiple AI models in one place — is smart differentiation that neither competitor matches." },
      { text: "Deploy Trainium custom chips to eliminate Nvidia dependency at scale", ambition: 4, likelihood: 4, what: "Amazon designed its own AI chips called Trainium specifically to run AI workloads more cheaply than Nvidia's chips. Instead of paying Nvidia's premium prices, Amazon trains AI on its own hardware and offers Trainium to AWS customers.", why: "Nvidia chips are expensive. For Amazon, which runs enormous AI workloads internally and for customers, even a 20% cost reduction saves billions annually. CEO Andy Jassy has said that at scale, Trainium will save tens of billions in capital expenditure.", status: "Accelerating. Amazon's custom chip market share grew from 1.4% to 7.5% in under two years. Trainium3 started shipping in 2026 with nearly all capacity pre-sold. This strategy is working faster than most analysts expected." },
      { text: "Reinvent Alexa as a frontier AI assistant for 500M+ existing devices", ambition: 5, likelihood: 3, what: "Alexa launched in 2014 and dominated smart home voice assistants for years. Then ChatGPT arrived and made Alexa look primitive. Amazon is completely rebuilding Alexa with large language model technology. Alexa+ launched in 2026 at $19.99/month.", why: "Alexa is already on 500 million devices. If Alexa+ becomes genuinely good, Amazon has 500 million potential paying subscribers — instant distribution that ChatGPT and Gemini could only dream about.", status: "Early. Alexa+ is live but subscriber numbers haven't been disclosed. The rebuilt AI is significantly more capable than the old Alexa but still trails ChatGPT in open-ended conversation." },
      { text: "Win enterprise AI with Amazon Q competing against Microsoft Copilot", ambition: 4, likelihood: 3, what: "Amazon Q is an AI assistant built specifically for businesses — it connects to a company's internal documents, databases, code, and systems to answer questions and complete tasks.", why: "Every AWS enterprise customer is a potential Amazon Q customer. Microsoft Copilot has a head start through Office relationships, but Amazon is attacking from the cloud infrastructure angle where they already have deep enterprise penetration.", status: "Growing but behind. Amazon Q is live and being adopted by AWS enterprise customers. It hasn't yet matched the market presence of Microsoft Copilot, which benefits from the familiarity of the Office suite." },
      { text: "Apply AI to logistics and 1M+ robots for compounding cost advantages", ambition: 4, likelihood: 5, what: "Amazon has over 1 million robots in its warehouses. AI optimizes which products to store where based on predicted demand, routes robots to minimize travel time, predicts what you'll order before you order it, and positions inventory closer to you in advance.", why: "Amazon's retail business operates on razor-thin margins. AI-driven efficiency improvements translate to billions in savings at Amazon's scale. This is AI with a direct, measurable, immediate return on investment — no faith required.", status: "Already delivering results. Amazon's same-day delivery capability is a direct product of AI demand forecasting. Warehouse robot coordination has reduced fulfillment costs meaningfully. This is the most proven AI application on Amazon's list." },
      { text: "Build the most valuable health AI platform through One Medical + Pharmacy", ambition: 5, likelihood: 2, what: "Amazon acquired One Medical (primary care clinics) and runs Amazon Pharmacy. Combined with what Amazon knows about your purchasing habits, this creates a uniquely comprehensive view of health. AI applied to this data could transform preventive healthcare.", why: "Healthcare is the largest industry in the US and one of the least technologically advanced. A company that can use AI to predict health problems before they become serious has an enormous value proposition.", status: "Very early. The pieces are being assembled but the health AI vision is years from realization. Regulatory complexity around health data is enormous. This is Amazon's most ambitious and most speculative long-term bet." },
    ],
    radar: { model: 3, distribution: 4, data: 5, hardware: 4, monetization: 4, research: 3 },
  },
  TESLA: {
    id: "TESLA", name: "Tesla", color: "#FB7185", logo: "T",
    tagline: "The most ambitious bet in tech — car company, AI company, or both?",
    marketCap: "$1.1T", aiSpend: "$10B+/yr", revenue: "$25B/qtr",
    risk: 9, riskLabel: "Very High Risk",
    what: "Simultaneously a car company facing Chinese competition, a robotaxi company racing Waymo, a humanoid robot company, and an AI company building physical intelligence through 3 billion miles of real-world driving data.",
    primaryAI: "FSD (Full Self-Driving) + Grok integration + Dojo supercomputer + Optimus robots",
    threat: "Elon Musk himself. Not as a capability question — as a brand and attention question. Tesla's core customer demographic is making values-based decisions not to buy. Meanwhile BYD gains ground during this window of vulnerability.",
    goals: [
      { text: "Achieve genuinely unsupervised Full Self-Driving at commercial scale", ambition: 5, likelihood: 3, what: "Tesla's Full Self-Driving software uses cameras and AI neural networks trained on billions of miles of real driving data to navigate roads autonomously. True autonomy means no human needed at all.", why: "If Tesla achieves true autonomy, every Tesla vehicle transforms from a depreciating asset to a revenue-generating machine. A car that drives itself can work as a robotaxi 24 hours a day — generating income instead of sitting in a parking lot.", status: "Impressive but not there yet. FSD v13 handles most highway and city driving competently. Musk has promised full autonomy repeatedly and missed every timeline. True unsupervised autonomy in all conditions remains unsolved." },
      { text: "Launch Cybercab robotaxi network that transforms the revenue model", ambition: 5, likelihood: 2, what: "Cybercab is Tesla's purpose-built robotaxi — a vehicle with no steering wheel or pedals, designed entirely for autonomous passenger transport. Tesla began limited robotaxi operations in Austin, Texas in 2026.", why: "A successful robotaxi network would make Tesla one of the most profitable companies in history. Musk projects 70%+ gross margins on robotaxi revenue. A car that generates revenue 24/7 creates a completely different financial model than traditional auto manufacturing.", status: "Very early. Limited robotaxi operations are live in Austin. But 'limited operations in one city' and 'nationwide commercial network' are separated by an enormous gap of regulatory approvals, safety validation, and technology scaling." },
      { text: "Deploy Optimus humanoid robots in Tesla factories then externally", ambition: 5, likelihood: 2, what: "Optimus is Tesla's humanoid robot designed to look and move like a human so it can work in environments built for humans. Phase one is deploying Optimus in Tesla's own factories. Phase two is selling Optimus externally.", why: "Elon Musk has called Optimus potentially the most valuable product in history. A robot that can do any physical task a human can — at a fraction of the cost — would transform every industry that relies on human labor.", status: "Early prototype stage. Optimus robots are working in Tesla factories doing basic tasks. But the gap between controlled factory demonstrations and reliable real-world deployment across diverse environments is enormous. Commercial sales at any meaningful scale are years away." },
      { text: "Integrate Grok as the AI brain across all Tesla products", ambition: 4, likelihood: 4, what: "Grok is xAI's large language model — Elon Musk's AI company. Tesla vehicles now have 'Hey Grok' voice activation built in — you can have conversations, get information, and give commands through Grok while driving.", why: "Having a proprietary AI assistant built into every Tesla vehicle creates a captive audience for Grok and differentiates Tesla from every other car brand. Every conversation in every Tesla teaches Grok, making it smarter over time.", status: "Live and rolling out. The Hey Grok integration is shipping in Tesla vehicles. This is one of the few Tesla AI goals with a clear near-term delivery. How much customers actually use and value it is still being determined." },
      { text: "Scale energy storage (Megapack) as the highest-margin business", ambition: 4, likelihood: 4, what: "Tesla Megapack is a massive battery system the size of a shipping container that stores electricity for power grids. As the world builds more solar and wind power, grid-scale batteries become essential to store that energy and release it when needed.", why: "Megapack is already generating 24%+ gross margins — higher than Tesla's car business. As renewable energy adoption accelerates globally, the demand for grid-scale storage will explode. This business doesn't depend on Musk's brand or any unproven technology.", status: "Tesla's strongest current business. Energy revenue grew 67% in 2024. Megapack orders are backlogged months in advance. This is the most underappreciated part of Tesla's business and the one that would keep the company valuable even if the robotaxi and Optimus bets take longer than expected." },
    ],
    radar: { model: 3, distribution: 2, data: 4, hardware: 4, monetization: 2, research: 3 },
  },
};

// ─── RELATIONSHIPS ────────────────────────────────────────────────────────────
const RELATIONSHIPS = [
  { from: "NVIDIA", to: "META", type: "supplier", label: "GPU chips" },
  { from: "NVIDIA", to: "MSFT", type: "supplier", label: "Azure AI chips" },
  { from: "NVIDIA", to: "GOOGLE", type: "supplier", label: "Training chips" },
  { from: "NVIDIA", to: "AMAZON", type: "supplier", label: "AWS AI chips" },
  { from: "NVIDIA", to: "TESLA", type: "supplier", label: "Dojo AI chips" },
  { from: "MSFT", to: "META", type: "competing", label: "Enterprise AI" },
  { from: "GOOGLE", to: "META", type: "competing", label: "Consumer AI" },
  { from: "GOOGLE", to: "MSFT", type: "competing", label: "Cloud + enterprise" },
  { from: "GOOGLE", to: "TESLA", type: "competing", label: "Robotaxi (Waymo)" },
  { from: "AMAZON", to: "MSFT", type: "competing", label: "Cloud dominance" },
  { from: "AMAZON", to: "GOOGLE", type: "competing", label: "Cloud AI" },
  { from: "AMAZON", to: "TESLA", type: "competing", label: "Robotaxi (Zoox)" },
  { from: "APPLE", to: "GOOGLE", type: "partnered", label: "Gemini + AI dev" },
  { from: "APPLE", to: "MSFT", type: "competing", label: "Productivity AI" },
  { from: "TESLA", to: "APPLE", type: "partnered", label: "CarPlay integration" },
  { from: "META", to: "AMAZON", type: "partnered", label: "AWS compute deal" },
  { from: "META", to: "NVIDIA", type: "competing", label: "Building own chips (MTIA)" },
  { from: "GOOGLE", to: "NVIDIA", type: "competing", label: "Building own chips (TPU)" },
  { from: "AMAZON", to: "NVIDIA", type: "competing", label: "Building own chips (Trainium)" },
];

const REL_COLORS = { supplier: "#FBBF24", competing: "#FB7185", partnered: "#4ADE80" };

const DIMS = ["model", "distribution", "data", "hardware", "monetization", "research"];
const DIM_LABELS = { model: "AI Model", distribution: "Distribution", data: "Data Moat", hardware: "Hardware", monetization: "Monetization", research: "Research" };

const NAV = [
  { id: "overview", label: "Overview", icon: "🏠" },
  { id: "goals", label: "Their Plan", icon: "🎯" },
  { id: "signals", label: "Signals", icon: "⚡" },
  { id: "network", label: "Connections", icon: "🗺️" },
  { id: "radar", label: "Compare", icon: "📡" },
];

const NODE_POSITIONS = {
  META: { x: 0.5, y: 0.08 }, MSFT: { x: 0.88, y: 0.28 }, GOOGLE: { x: 0.88, y: 0.65 },
  NVIDIA: { x: 0.5, y: 0.85 }, APPLE: { x: 0.12, y: 0.65 }, AMAZON: { x: 0.12, y: 0.28 }, TESLA: { x: 0.5, y: 0.46 },
};

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function InfoBtn({ termKey, onPress }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onPress(termKey); }}
      style={{ width: 15, height: 15, borderRadius: "50%", background: SUBTLE, border: `1px solid ${BORDER}`, color: MUTED, fontSize: 8, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center", marginLeft: 4, flexShrink: 0, verticalAlign: "middle" }}
    >ⓘ</button>
  );
}

function DefPopup({ termKey, onClose }) {
  if (!termKey) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000088", zIndex: 100, display: "flex", alignItems: "flex-end" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", background: "#151f2e", borderRadius: "16px 16px 0 0", padding: "20px 20px 36px", border: `1px solid ${BORDER}` }}>
        <div style={{ width: 36, height: 4, background: BORDER, borderRadius: 2, margin: "0 auto 16px" }} />
        <div style={{ fontSize: 14, fontWeight: 700, color: TEXT, marginBottom: 10 }}>{termKey}</div>
        <p style={{ fontSize: 15, color: "#CBD5E1", lineHeight: 1.75 }}>{DEFINITIONS[termKey]}</p>
        <button onClick={onClose} style={{ marginTop: 18, width: "100%", padding: "11px 0", borderRadius: 10, background: SUBTLE, color: MUTED, fontSize: 13, fontWeight: 600 }}>Got it</button>
      </div>
    </div>
  );
}

function GoalCard({ goal, companyColor }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={{ borderRadius: 12, background: CARD, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ padding: "14px 16px", cursor: "pointer" }}>
        <p style={{ fontSize: 14, color: "#CBD5E1", marginBottom: 12, lineHeight: 1.6 }}>{goal.text}</p>
        <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
          {[["Ambition", goal.ambition, companyColor], ["Likelihood", goal.likelihood, "#4ADE80"]].map(([label, val, col]) => (
            <div key={label}>
              <div style={{ fontSize: 9, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 5 }}>{label.toUpperCase()}</div>
              <div style={{ display: "flex", gap: 3 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <div key={n} style={{ width: 15, height: 15, borderRadius: 3, background: n <= val ? col : SUBTLE }} />
                ))}
              </div>
            </div>
          ))}
        </div>
        <span style={{ fontSize: 11, color: companyColor, fontWeight: 600 }}>{expanded ? "Hide details ▲" : "Learn more ▼"}</span>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["WHAT THIS MEANS", goal.what, companyColor],
            ["WHY IT MATTERS", goal.why, "#FBBF24"],
            ["CURRENT STATUS", goal.status, "#4ADE80"],
          ].map(([label, content, col]) => (
            <div key={label} style={{ padding: "12px 14px", borderRadius: 9, background: `${col}08`, border: `1px solid ${col}20` }}>
              <div style={{ fontSize: 9, color: col, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
              <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7 }}>{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SignalCard({ signal, type }) {
  const [expanded, setExpanded] = useState(false);
  const col = type === "green" ? "#4ADE80" : "#FB7185";
  return (
    <div style={{ borderRadius: 12, background: CARD, border: `1px solid ${col}18`, overflow: "hidden" }}>
      <div onClick={() => setExpanded((e) => !e)} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: "13px 16px", cursor: "pointer" }}>
        <div style={{ width: 5, height: 5, borderRadius: "50%", marginTop: 6, flexShrink: 0, background: col }} />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.65, marginBottom: 6 }}>{signal.text}</p>
          <span style={{ fontSize: 11, color: col, fontWeight: 600 }}>{expanded ? "Hide details ▲" : "Learn more ▼"}</span>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: `1px solid ${BORDER}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            ["WHAT THIS MEANS", signal.what, col],
            ["WHY IT MATTERS", signal.why, "#FBBF24"],
          ].map(([label, content, c]) => (
            <div key={label} style={{ padding: "12px 14px", borderRadius: 9, background: `${c}08`, border: `1px solid ${c}20` }}>
              <div style={{ fontSize: 9, color: c, fontWeight: 700, letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
              <p style={{ fontSize: 13, color: "#CBD5E1", lineHeight: 1.7 }}>{content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function NetworkMap({ selectedCompany, onSelectCompany }) {
  const [size, setSize] = useState({ w: 340, h: 360 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ w: rect.width || 340, h: 360 });
    }
  }, []);

  const W = size.w;
  const H = size.h;
  const PAD = 36;

  const nodePos = (id) => ({
    x: PAD + NODE_POSITIONS[id].x * (W - PAD * 2),
    y: PAD + NODE_POSITIONS[id].y * (H - PAD * 2),
  });

  const isConnected = (id) =>
    !selectedCompany ||
    id === selectedCompany ||
    RELATIONSHIPS.some((r) => (r.from === selectedCompany && r.to === id) || (r.to === selectedCompany && r.from === id));

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg width={W} height={H} style={{ display: "block" }}>
        {RELATIONSHIPS.map((r, i) => {
          const from = nodePos(r.from);
          const to = nodePos(r.to);
          const col = REL_COLORS[r.type];
          const isActive = !selectedCompany || r.from === selectedCompany || r.to === selectedCompany;
          const mx = (from.x + to.x) / 2;
          const my = (from.y + to.y) / 2;
          const dx = to.y - from.y;
          const dy = -(to.x - from.x);
          const len = Math.sqrt(dx * dx + dy * dy) || 1;
          return (
            <path
              key={i}
              d={`M ${from.x} ${from.y} Q ${mx + (dx / len) * 16} ${my + (dy / len) * 16} ${to.x} ${to.y}`}
              stroke={col}
              strokeWidth={isActive ? 1.5 : 0.4}
              strokeOpacity={isActive ? 0.7 : 0.12}
              fill="none"
              strokeDasharray={r.type === "competing" ? "4 3" : "none"}
            />
          );
        })}
        {Object.keys(COMPANIES).map((id) => {
          const co = COMPANIES[id];
          const pos = nodePos(id);
          const isSel = selectedCompany === id;
          const connected = isConnected(id);
          const r = isSel ? 22 : 18;
          return (
            <g key={id} onClick={() => onSelectCompany(isSel ? null : id)} style={{ cursor: "pointer" }}>
              <circle cx={pos.x} cy={pos.y} r={r + 5} fill={co.color} fillOpacity={isSel ? 0.15 : 0.04} />
              <circle cx={pos.x} cy={pos.y} r={r} fill={CARD} stroke={co.color} strokeWidth={isSel ? 2.5 : 1.5} strokeOpacity={connected ? 1 : 0.2} fillOpacity={connected ? 1 : 0.3} />
              <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="middle" fontSize={id === "AMAZON" ? 8 : 10} fontWeight="800" fill={co.color} fillOpacity={connected ? 1 : 0.25} style={{ fontFamily: "Inter, sans-serif", pointerEvents: "none" }}>{co.logo}</text>
              <text x={pos.x} y={pos.y + r + 10} textAnchor="middle" fontSize={9} fontWeight={isSel ? "700" : "500"} fill={connected ? "#94A3B8" : "#2d3748"} style={{ fontFamily: "Inter, sans-serif", pointerEvents: "none" }}>{co.name}</text>
            </g>
          );
        })}
      </svg>

      {selectedCompany && (
        <div style={{ marginTop: 6, padding: "10px 12px", borderRadius: 10, background: CARD, border: `1px solid ${COMPANIES[selectedCompany].color}30` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: COMPANIES[selectedCompany].color, marginBottom: 8 }}>{COMPANIES[selectedCompany].name} — Connections</div>
          {RELATIONSHIPS.filter((r) => r.from === selectedCompany || r.to === selectedCompany).map((r, i) => {
            const isFrom = r.from === selectedCompany;
            const other = isFrom ? r.to : r.from;
            const col = REL_COLORS[r.type];
            const dirLabel = r.type === "supplier" ? (isFrom ? "Sells chips to" : "Buys chips from") : r.type === "partnered" ? "Working together with" : "Racing against";
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, padding: "5px 8px", borderRadius: 7, background: `${col}0c` }}>
                <span style={{ fontSize: 9, color: col, fontWeight: 700, minWidth: 90 }}>{dirLabel.toUpperCase()}</span>
                <span style={{ fontSize: 12, color: "#94A3B8", fontWeight: 600, flex: 1 }}>{COMPANIES[other].name}</span>
                <span style={{ fontSize: 10, color: MUTED }}>{r.label}</span>
              </div>
            );
          })}
          <button onClick={() => onSelectCompany(null)} style={{ marginTop: 8, width: "100%", padding: "6px 0", borderRadius: 7, background: SUBTLE, color: MUTED, fontSize: 10, fontWeight: 600 }}>Clear</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 14, marginTop: 8, padding: "8px 12px", borderRadius: 8, background: SUBTLE }}>
        {[["supplier", "Supply Chain"], ["competing", "Racing Against"], ["partnered", "Working Together"]].map(([type, label]) => (
          <div key={type} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <svg width={20} height={8}>
              <line x1={0} y1={4} x2={20} y2={4} stroke={REL_COLORS[type]} strokeWidth={1.5} strokeDasharray={type === "competing" ? "3 2" : "none"} />
            </svg>
            <span style={{ fontSize: 9, color: MUTED }}>{label}</span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 10, color: "#374151", marginTop: 5, textAlign: "center" }}>Tap a company to highlight its connections</p>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [selected, setSelected] = useState("NVIDIA");
  const [tab, setTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signalView, setSignalView] = useState("green");
  const [networkView, setNetworkView] = useState("map");
  const [relFilter, setRelFilter] = useState("all");
  const [mapHighlight, setMapHighlight] = useState(null);
  const [radarSelected, setRadarSelected] = useState(["META", "MSFT", "GOOGLE", "NVIDIA", "APPLE", "AMAZON", "TESLA"]);
  const [activeDef, setActiveDef] = useState(null);

  const c = COMPANIES[selected];
  const signals = SIGNALS[selected];

  const toggleRadar = (id) =>
    setRadarSelected((prev) =>
      prev.length === 1 && prev.includes(id) ? prev : prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const radarData = DIMS.map((dim) => {
    const point = { dim: DIM_LABELS[dim] };
    radarSelected.forEach((id) => { point[id] = COMPANIES[id].radar[dim]; });
    return point;
  });

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: BG, fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif", color: TEXT, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1F2937; border-radius: 2px; }
        button { font-family: inherit; cursor: pointer; border: none; }
      `}</style>

      <DefPopup termKey={activeDef} onClose={() => setActiveDef(null)} />

      {/* TOP BAR */}
      <div style={{ display: "flex", alignItems: "center", padding: "0 16px", height: 48, borderBottom: `1px solid ${BORDER}`, background: "#0D1117", flexShrink: 0, gap: 12 }}>
        <button onClick={() => setSidebarOpen((o) => !o)} style={{ width: 32, height: 32, borderRadius: 8, background: SUBTLE, color: MUTED, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>☰</button>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>AI Race</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 700, color: c.color, letterSpacing: "-0.02em" }}>Intel</span>
          <span style={{ fontSize: 10, color: MUTED, marginLeft: 4 }}>2026</span>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", boxShadow: "0 0 8px #4ADE80aa" }} />
          <span style={{ fontSize: 10, color: "#4ADE80", fontWeight: 600 }}>Live</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", overflow: "hidden", position: "relative" }}>

        {/* SIDEBAR */}
        {sidebarOpen && <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "#00000077", zIndex: 20 }} />}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 200, background: "#0D1117", borderRight: `1px solid ${BORDER}`, zIndex: 30, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease", display: "flex", flexDirection: "column", paddingTop: 8 }}>
          <div style={{ padding: "8px 14px 10px", fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.1em" }}>COMPANIES</div>
          {Object.keys(COMPANIES).map((id) => {
            const co = COMPANIES[id];
            const isSel = selected === id;
            return (
              <button key={id} onClick={() => { setSelected(id); setTab("overview"); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: isSel ? `${co.color}15` : "transparent", borderLeft: `3px solid ${isSel ? co.color : "transparent"}`, transition: "all 0.15s" }}>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: isSel ? `${co.color}25` : SUBTLE, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: isSel ? co.color : MUTED, flexShrink: 0 }}>{co.logo}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isSel ? TEXT : "#94A3B8" }}>{co.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
                    <div style={{ flex: 1, height: 2, background: SUBTLE, borderRadius: 1, overflow: "hidden" }}>
                      <div style={{ width: `${co.risk * 10}%`, height: "100%", background: riskColor(co.risk) }} />
                    </div>
                    <span style={{ fontSize: 9, color: riskColor(co.risk), fontWeight: 700, fontFamily: "monospace" }}>{co.risk}/10</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* MAIN PANEL */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

          {/* HEADER */}
          <div style={{ padding: "10px 16px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0, background: `linear-gradient(to right, ${c.color}10, transparent)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${c.color}20`, border: `1.5px solid ${c.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: c.color, flexShrink: 0 }}>{c.logo}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: TEXT, letterSpacing: "-0.02em" }}>{c.name}</span>
                  <span style={{ fontSize: 10, color: riskColor(c.risk), fontWeight: 700, background: `${riskColor(c.risk)}18`, padding: "2px 8px", borderRadius: 20, border: `1px solid ${riskColor(c.risk)}30`, display: "inline-flex", alignItems: "center" }}>
                    {c.riskLabel}<InfoBtn termKey="Risk Level" onPress={setActiveDef} />
                  </span>
                </div>
                <p style={{ fontSize: 11, color: MUTED, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.tagline}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {[["Market Cap", c.marketCap], ["AI Spend", c.aiSpend], ["Revenue", c.revenue]].map(([l, v]) => (
                <div key={l} style={{ flex: 1, padding: "6px 8px", background: SUBTLE, borderRadius: 7, textAlign: "center" }}>
                  <div style={{ fontSize: 8, color: MUTED, fontWeight: 600, letterSpacing: "0.04em", marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    {l.toUpperCase()}<InfoBtn termKey={l} onPress={setActiveDef} />
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.color, fontFamily: "monospace" }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px 80px" }}>

            {/* OVERVIEW */}
            {tab === "overview" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${c.color}30`, background: `${c.color}08` }}>
                  <div style={{ fontSize: 10, color: c.color, fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8 }}>WHAT THEY ARE</div>
                  <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.75 }}>{c.what}</p>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD }}>
                  <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 6, display: "flex", alignItems: "center", gap: 2 }}>
                    PRIMARY AI<InfoBtn termKey="Primary AI" onPress={setActiveDef} />
                  </div>
                  <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6 }}>{c.primaryAI}</p>
                </div>
                <div style={{ padding: "14px 16px", borderRadius: 12, border: `1px solid ${riskColor(c.risk)}25`, background: `${riskColor(c.risk)}07` }}>
                  <div style={{ fontSize: 10, color: riskColor(c.risk), fontWeight: 700, letterSpacing: "0.08em", marginBottom: 8, display: "flex", alignItems: "center", gap: 4 }}>
                    ⚠ BIGGEST THREAT<InfoBtn termKey="Biggest Threat" onPress={setActiveDef} />
                  </div>
                  <p style={{ fontSize: 14, color: "#CBD5E1", lineHeight: 1.75 }}>{c.threat}</p>
                </div>
                <div style={{ padding: "12px 16px", borderRadius: 12, border: `1px solid ${BORDER}`, background: CARD }}>
                  <div style={{ fontSize: 10, color: MUTED, fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10, display: "flex", alignItems: "center", gap: 2 }}>
                    RISK LEVEL<InfoBtn termKey="Risk Level" onPress={setActiveDef} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ flex: 1, height: 6, background: SUBTLE, borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${c.risk * 10}%`, height: "100%", background: `linear-gradient(90deg, ${c.color}, ${riskColor(c.risk)})`, borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 20, fontWeight: 800, color: riskColor(c.risk), fontFamily: "monospace" }}>{c.risk}/10</span>
                    <span style={{ fontSize: 10, color: riskColor(c.risk), fontWeight: 700, background: `${riskColor(c.risk)}15`, padding: "3px 8px", borderRadius: 20 }}>{c.riskLabel}</span>
                  </div>
                </div>
              </div>
            )}

            {/* GOALS */}
            {tab === "goals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <p style={{ fontSize: 11, color: MUTED, marginBottom: 2 }}>Tap any goal to expand — see what it means, why it matters, and where things stand today.</p>
                {c.goals.map((g, i) => (
                  <GoalCard key={i} goal={g} companyColor={c.color} />
                ))}
                <p style={{ fontSize: 10, color: "#374151", marginTop: 2 }}>Not financial advice. Based on publicly available data and analyst consensus.</p>
              </div>
            )}

            {/* SIGNALS */}
            {tab === "signals" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, padding: 4, background: SUBTLE, borderRadius: 10 }}>
                  {[["green", "✅ Green Flags", "#4ADE80"], ["red", "🚩 Red Flags", "#FB7185"]].map(([v, label, col]) => (
                    <button key={v} onClick={() => setSignalView(v)} style={{ flex: 1, padding: "9px 0", borderRadius: 7, background: signalView === v ? CARD : "transparent", color: signalView === v ? col : MUTED, fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}>{label}</button>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                  {signalView === "green" ? "Signs the company's AI strategy is working. Tap any signal to learn more." : "Early warning signs something may be going wrong. Tap any signal to learn more."}
                  <InfoBtn termKey={signalView === "green" ? "Good Signs" : "Warning Signs"} onPress={setActiveDef} />
                </p>
                {(signalView === "green" ? signals.green : signals.red).map((signal, i) => (
                  <SignalCard key={i} signal={signal} type={signalView} />
                ))}
              </div>
            )}

            {/* NETWORK */}
            {tab === "network" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", gap: 8, padding: 4, background: SUBTLE, borderRadius: 10 }}>
                  {[["map", "🗺️ Map View"], ["list", "📋 List View"]].map(([v, label]) => (
                    <button key={v} onClick={() => setNetworkView(v)} style={{ flex: 1, padding: "8px 0", borderRadius: 7, background: networkView === v ? CARD : "transparent", color: networkView === v ? TEXT : MUTED, fontSize: 12, fontWeight: 700, transition: "all 0.2s" }}>{label}</button>
                  ))}
                </div>
                {networkView === "map" && <NetworkMap selectedCompany={mapHighlight} onSelectCompany={setMapHighlight} />}
                {networkView === "list" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {[["all", "All"], ["supplier", "Supply Chain"], ["competing", "Racing Against"], ["partnered", "Working Together"]].map(([v, label]) => {
                        const col = v === "all" ? "#94A3B8" : REL_COLORS[v];
                        return (
                          <button key={v} onClick={() => setRelFilter(v)} style={{ padding: "6px 12px", borderRadius: 20, background: relFilter === v ? `${col}20` : SUBTLE, color: relFilter === v ? col : MUTED, fontSize: 11, fontWeight: 600, border: `1px solid ${relFilter === v ? col + "40" : "transparent"}` }}>{label}</button>
                        );
                      })}
                    </div>
                    {Object.keys(COMPANIES).map((id) => {
                      const rels = RELATIONSHIPS.filter((r) => (r.from === id || r.to === id) && (relFilter === "all" || r.type === relFilter));
                      if (rels.length === 0) return null;
                      const co = COMPANIES[id];
                      return (
                        <div key={id} style={{ padding: "13px 16px", borderRadius: 12, background: CARD, border: `1px solid ${id === selected ? co.color + "30" : BORDER}` }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: co.color, marginBottom: 10 }}>{co.name}</div>
                          {rels.map((r, i) => {
                            const isFrom = r.from === id;
                            const other = isFrom ? r.to : r.from;
                            const col = REL_COLORS[r.type];
                            const dirLabel = r.type === "supplier" ? (isFrom ? "Sells chips to" : "Buys chips from") : r.type === "partnered" ? "Working together with" : "Racing against";
                            return (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, padding: "5px 10px", borderRadius: 8, background: `${col}0a` }}>
                                <span style={{ fontSize: 9, color: col, fontWeight: 700, minWidth: 90 }}>{dirLabel.toUpperCase()}</span>
                                <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 600, flex: 1 }}>{COMPANIES[other].name}</span>
                                <span style={{ fontSize: 10, color: MUTED }}>{r.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* RADAR */}
            {tab === "radar" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <p style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>Tap to toggle companies. At least one must remain selected.</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {Object.keys(COMPANIES).map((id) => {
                      const co = COMPANIES[id];
                      const active = radarSelected.includes(id);
                      const isLast = radarSelected.length === 1 && active;
                      return (
                        <button key={id} onClick={() => toggleRadar(id)} style={{ padding: "5px 12px", borderRadius: 20, background: active ? `${co.color}20` : SUBTLE, color: active ? co.color : MUTED, fontSize: 11, fontWeight: 600, border: `1px solid ${active ? co.color + "50" : "transparent"}`, opacity: isLast ? 0.5 : 1 }}>{co.name}</button>
                      );
                    })}
                  </div>
                </div>
                <div style={{ height: 280, background: CARD, borderRadius: 12, border: `1px solid ${BORDER}`, padding: 8 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke={BORDER} />
                      <PolarAngleAxis dataKey="dim" tick={{ fill: MUTED, fontSize: 10, fontFamily: "Inter, sans-serif" }} />
                      {radarSelected.map((id) => (
                        <Radar key={id} name={COMPANIES[id].name} dataKey={id} stroke={COMPANIES[id].color} fill={COMPANIES[id].color} fillOpacity={0.08} strokeWidth={1.5} dot={{ r: 2, fill: COMPANIES[id].color }} />
                      ))}
                      <Tooltip contentStyle={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT, fontSize: 11 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                  {DIMS.map((dim) => (
                    <div key={dim} style={{ padding: "10px 12px", borderRadius: 10, background: CARD, border: `1px solid ${BORDER}` }}>
                      <div style={{ fontSize: 9, color: MUTED, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 6, display: "flex", alignItems: "center", gap: 2 }}>
                        {DIM_LABELS[dim].toUpperCase()}<InfoBtn termKey={DIM_LABELS[dim]} onPress={setActiveDef} />
                      </div>
                      {Object.keys(COMPANIES).filter((id) => radarSelected.includes(id)).sort((a, b) => COMPANIES[b].radar[dim] - COMPANIES[a].radar[dim]).map((id) => {
                        const score = COMPANIES[id].radar[dim];
                        return (
                          <div key={id} style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                            <div style={{ width: 5, height: 5, borderRadius: "50%", background: COMPANIES[id].color, flexShrink: 0 }} />
                            <span style={{ fontSize: 10, color: "#94A3B8", flex: 1 }}>{COMPANIES[id].name}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: scoreColor(score), fontFamily: "monospace" }}>{score}/5</span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div style={{ height: 60, borderTop: `1px solid ${BORDER}`, background: "#0D1117", display: "flex", alignItems: "center", flexShrink: 0, zIndex: 10 }}>
        {NAV.map(({ id, label, icon }) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, background: "transparent", padding: "8px 0", color: active ? c.color : MUTED, transition: "color 0.2s" }}>
              <span style={{ fontSize: 18, lineHeight: 1 }}>{icon}</span>
              <span style={{ fontSize: 9, fontWeight: active ? 700 : 500, letterSpacing: "0.04em" }}>{label.toUpperCase()}</span>
              {active && <div style={{ width: 16, height: 2, borderRadius: 1, background: c.color, marginTop: 1 }} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
