begin;

with seed(slug,title,audience,page_type,layout_key,seo,data) as (
values
('about','About Oye !magine','Brands, operators and partners','marketing','premium_cms_v1',
 '{"title":"About Oye !magine | An AI-native growth operating company","description":"Why Oye !magine exists: to turn fragmented digital marketing into one intelligent, governed and continuously learning operating system."}'::jsonb,
 $$ {
  "eyebrow":"Why Oye !magine exists",
  "title":"Marketing became a pile of tools. We are building the intelligence that sits above them.",
  "body":"Oye !magine is an AI-native growth operating company built for brands that want strategy, creation, execution, governance, commercial control and learning to behave like one system instead of disconnected teams and dashboards.",
  "badges":["India-first · globally ambitious","AI-native · human-governed","Multi-tenant by design"],
  "primary":{"label":"See the platform","href":"/platform"},
  "secondary":{"label":"Talk to Oye","href":"/contact"},
  "sections":[
   {"type":"cards","eyebrow":"The belief","title":"The best growth system should remember what worked.","body":"Every approved strategy, creative, campaign, keyword, post, experiment and outcome should make the next decision better without leaking one client's private truth into another.","tone":"paper","cards":[
    {"title":"Understand first","body":"Brand truth, audience, category, product, constraints and evidence come before generation."},
    {"title":"Create with memory","body":"Prompts, assets, approvals and performance remain traceable so winning patterns can compound."},
    {"title":"Execute with control","body":"AI can move fast, but publishing, spend and commercial actions still respect assigned authority."},
    {"title":"Learn continuously","body":"Outcome-linked learning becomes institutional intelligence rather than disappearing inside campaigns."}
   ]},
   {"type":"split","eyebrow":"Made in India","title":"Built for the complexity real Indian businesses live with.","body":"English and Hindi interaction, India-format commercial workflows, GST-aware billing, consent and messaging controls, recurring subscription logic and role-governed delivery are part of the operating model, not regional patches.","bullets":["English, Hindi and Hinglish interaction architecture","KYC → agreement → eSign → payment → invoice → activation","Customer-specific private storage and tenant boundaries","Provider abstraction so clients experience one Oye !magine layer"],"tone":"yellow"},
   {"type":"cta","eyebrow":"Oye means listen","title":"Tell us the strange idea. The system should do the hard thinking from there.","body":"Oye !magine is designed to research, challenge weak assumptions, build a better plan and explain the next useful move in clear language.","primary":{"label":"Create a workspace","href":"/signup"},"secondary":{"label":"Explore solutions","href":"/solutions"},"tone":"pink"}
  ]
 } $$::jsonb),
('platform','Platform','Prospective customers and operators','marketing','premium_cms_v1',
 '{"title":"Oye !magine Platform | The AI Growth OS","description":"One governed growth operating system for brand intelligence, strategy, creative, channels, analytics, commercial controls and continuous learning."}'::jsonb,
 $$ {
  "eyebrow":"The AI Growth OS",
  "title":"From a rough idea to a governed growth loop. One system remembers the whole journey.",
  "body":"Oye !magine combines brand intelligence, research, strategy, creative generation, channel operations, analytics, approvals, commercial control and institutional learning in one tenant-aware operating layer.",
  "badges":["Understand → Imagine → Create → Approve → Launch → Learn → Grow","Provider-neutral","Approval-aware"],
  "primary":{"label":"See pricing","href":"/pricing"},"secondary":{"label":"Create workspace","href":"/signup"},
  "sections":[
   {"type":"cards","eyebrow":"One operating loop","title":"The platform is organised around work, not vendor menus.","tone":"paper","cards":[
    {"title":"Brand Intelligence","body":"Canonical brand, category, audience, language and evidence memory before strategy or generation."},
    {"title":"Research & Strategy","body":"Research-first recommendations, competitor context, priorities and editable strategy artifacts."},
    {"title":"Creative & Content","body":"Images, video, copy, variants, lineage, rights, approval and private client asset libraries."},
    {"title":"Growth Execution","body":"Paid, organic, SEO and lifecycle work prepared in one governed execution model."},
    {"title":"Analytics & Learning","body":"Freshness, lineage, attribution, reports, prompt outcomes and reusable learning patterns."},
    {"title":"Commercial OS","body":"KYC, contracts, subscriptions, invoices, media balances and approval-bound financial state."}
   ]},
   {"type":"split","eyebrow":"Ask Oye","title":"Search the system the way you would ask a very good operator.","body":"Users should not need to remember where every setting lives. Ask in English, Hindi or Hinglish. Oye resolves the user's permissions, researches where needed, finds the relevant configuration or evidence and routes the next action.","bullets":["Permission-aware global search","Voice and text interaction architecture","Research before high-impact recommendations","Deep links to the exact configuration or workflow"],"tone":"ink"},
   {"type":"cta","eyebrow":"Start small. Compound intelligence.","title":"Your first campaign should teach the hundredth campaign something useful.","body":"The more governed work Oye performs, the richer its evidence and decision memory become.","primary":{"label":"Choose an edition","href":"/pricing"},"secondary":{"label":"See Trust Center","href":"/trust"},"tone":"yellow"}
  ]
 } $$::jsonb),
('solutions','Solutions','Brands, commerce teams, agencies and enterprises','marketing','premium_cms_v1',
 '{"title":"Oye !magine Solutions | Growth operating models for every stage","description":"Oye !magine operating models for e-commerce, growing businesses, agencies, enterprises, managed growth and white-label partners."}'::jsonb,
 $$ {
  "eyebrow":"Solutions",
  "title":"Different businesses need different operating models. They should not need different intelligence.",
  "body":"Oye !magine adapts the same governed growth loop to the customer's category, maturity, commercial model, channels, team and approval structure.",
  "primary":{"label":"Compare editions","href":"/pricing"},"secondary":{"label":"Talk through your model","href":"/contact"},
  "sections":[
   {"type":"cards","eyebrow":"Choose the shape","title":"One core platform. Six ways to operate it.","tone":"paper","cards":[
    {"title":"E-commerce","body":"Product and category intelligence, creative velocity, acquisition, revenue evidence and conversion learning.","href":"/customers/neejee","linkLabel":"See the pilot"},
    {"title":"Growing businesses","body":"Replace fragmented agencies and tools with a visible plan, controlled execution and one source of learning."},
    {"title":"Enterprise","body":"Deeper identity, policy, audit, integration and assurance for complex organisations."},
    {"title":"Agencies","body":"Separated client workspaces, team roles, approval queues, commercial controls and client reporting."},
    {"title":"Managed Growth","body":"The platform plus an accountable operating team that works inside the same evidence and approval system."},
    {"title":"White Label","body":"A partner-led customer experience with strong downstream tenant separation and operating controls."}
   ]},
   {"type":"steps","eyebrow":"How Oye decides","title":"The platform should challenge the brief before spending money on it.","bullets":["Understand the business and requested outcome","Research current category, customer and channel evidence","Identify contradictions or weak assumptions","Recommend the highest-confidence path","Generate governed work","Measure the result and feed it back into learning"],"tone":"pink"},
   {"type":"cta","title":"If your use case is unusual, that is exactly what Ask Oye is meant for.","body":"Describe the outcome in ordinary language. Oye should map the right combination of research, capabilities, people and controls.","primary":{"label":"Start a conversation","href":"/contact"},"tone":"yellow"}
  ]
 } $$::jsonb),
('customers','Customers','Prospective customers','marketing','premium_cms_v1',
 '{"title":"Customers | Oye !magine","description":"How Oye !magine proves the Growth OS against real customer contexts without inventing performance evidence."}'::jsonb,
 $$ {
  "eyebrow":"Customer proof",
  "title":"A customer story is useful only when the evidence is real.",
  "body":"Oye !magine separates product capability from verified execution. We do not turn preview screens, fixtures or unconnected channels into invented case-study results.",
  "primary":{"label":"Explore Neejee pilot","href":"/customers/neejee"},"secondary":{"label":"Become a pilot customer","href":"/contact"},
  "sections":[
   {"type":"split","eyebrow":"First controlled pilot","title":"Neejee: founder-curated craft discovery and commerce.","body":"Neejee gives Oye a demanding commerce context: brand provenance, many craft categories, rich editorial storytelling, product discovery, creative generation and revenue-linked growth learning.","bullets":["Canonical commerce truth instead of synthetic vertical assumptions","Private customer asset storage","Strategy, creative, SEO and campaign generation","Approvals before publication or spend","Analytics and commerce evidence before optimisation claims"],"primary":{"label":"Read Neejee pilot","href":"/customers/neejee"},"tone":"pink"},
   {"type":"cards","eyebrow":"Proof ladder","title":"What Oye calls evidence.","tone":"paper","cards":[
    {"title":"Capability","body":"The code and workflow exist."},{"title":"Configured","body":"The tenant and required settings are configured."},{"title":"Connected","body":"The external account has authenticated successfully."},{"title":"Read verified","body":"Oye can ingest real data and reconcile identifiers."},{"title":"Executed","body":"A governed action actually happened externally."},{"title":"Measured","body":"Outcome data returned and can support the next learning cycle."}
   ]},
   {"type":"cta","title":"Want Oye to learn your category next?","body":"We can start with a controlled workspace and build proof without pretending the last mile is live before it is.","primary":{"label":"Create workspace","href":"/signup"},"tone":"yellow"}
  ]
 } $$::jsonb),
('integrations','Integrations','Customers and technical evaluators','marketing','premium_cms_v1',
 '{"title":"Integrations | Oye !magine","description":"Provider-neutral connections for AI, media, analytics, lifecycle, commerce and commercial execution behind one Oye !magine experience."}'::jsonb,
 $$ {
  "eyebrow":"Integration fabric",
  "title":"Clients should connect outcomes, not learn our vendor stack.",
  "body":"Oye !magine abstracts the underlying technology. Super Admin configures approved capabilities centrally; customer workspaces see connection purpose, health, permissions, freshness and evidence without internal provider disclosure.",
  "badges":["Provider-neutral","Health checked","Tenant scoped","Credential values never returned to clients"],
  "primary":{"label":"See the platform","href":"/platform"},"secondary":{"label":"Trust architecture","href":"/trust"},
  "sections":[
   {"type":"cards","eyebrow":"Capability families","title":"The connections Oye needs to run a modern growth loop.","tone":"paper","cards":[
    {"title":"AI intelligence","body":"Reasoning, research, generation, embeddings and speech capabilities routed internally by task."},
    {"title":"Creative media","body":"Image, video, audio and derivative generation with private storage and provenance."},
    {"title":"Paid channels","body":"Campaign objects, approvals, spend envelopes, execution evidence and readback."},
    {"title":"Analytics & search","body":"Traffic, conversion, search visibility, revenue evidence, freshness and lineage."},
    {"title":"Lifecycle","body":"Email, messaging and notification delivery under consent and assigned-role approval."},
    {"title":"Commercial","body":"Digital agreement, subscription payment, recurring mandate and invoice evidence."}
   ]},
   {"type":"split","eyebrow":"Autonomous Integration Radar","title":"When Oye needs a capability we do not yet have, the system should say exactly what is missing.","body":"The platform can identify a future technology need, research official prerequisites, tell Super Admin which account and credentials are required, generate and test a candidate adapter, and hold production promotion behind the release gate.","bullets":["No client-facing vendor disclosure","No plaintext credentials in code","Fallback routing when approved","Health, quota and expiry signals","Canary before new adapter promotion"],"tone":"ink"},
   {"type":"cta","title":"One Oye experience. Replaceable infrastructure underneath.","primary":{"label":"Talk integrations","href":"/contact?interest=integrations"},"tone":"pink"}
  ]
 } $$::jsonb),
('marketplace','Marketplace','Brands, specialists and managed-service buyers','marketing','premium_cms_v1',
 '{"title":"Marketplace | Oye !magine","description":"Bring specialist humans into the same governed Oye !magine workflow when the outcome needs expertise, craft or accountable delivery."}'::jsonb,
 $$ {
  "eyebrow":"Specialist marketplace",
  "title":"AI should remove coordination waste, not pretend every outcome needs no human expertise.",
  "body":"Oye can route scoped work to assigned specialists and partners while keeping briefs, customer boundaries, deliverables, approvals, evidence and commercial state inside the same operating system.",
  "primary":{"label":"Discuss managed growth","href":"/contact?interest=managed"},"secondary":{"label":"See pricing","href":"/pricing"},
  "sections":[
   {"type":"cards","eyebrow":"Where specialists fit","title":"Human expertise, with system memory.","tone":"paper","cards":[
    {"title":"Creative craft","body":"Design direction, high-touch production and specialist creative work under brand truth and Designer approval."},
    {"title":"Growth operations","body":"Assigned digital marketers review and sign off campaign execution for their client scope."},
    {"title":"Technical delivery","body":"Landing pages, tracking, feeds, integrations and implementation work linked to acceptance evidence."},
    {"title":"Strategy & research","body":"Category or market specialists can add grounded context without owning the customer's private data outside scope."}
   ]},
   {"type":"split","eyebrow":"Scoped by default","title":"Partners see the work they are assigned. Nothing they are not.","body":"The marketplace role is a bounded workspace role. Super Admin can create more precise custom roles and revoke an individual permission without redesigning the group.","bullets":["Workspace-specific assignment","Deliverable and proposal lifecycle","Granular access overrides","Audit trail for approvals and hand-offs"],"tone":"yellow"},
   {"type":"cta","title":"Need the system plus people to operate it?","primary":{"label":"Explore Managed Growth","href":"/contact?interest=managed"},"tone":"pink"}
  ]
 } $$::jsonb),
('trust','Trust','Security, procurement and customer stakeholders','marketing','premium_cms_v1',
 '{"title":"Trust Center | Oye !magine","description":"How Oye !magine handles identity, tenant isolation, private storage, approvals, evidence, privacy and high-impact execution controls."}'::jsonb,
 $$ {
  "eyebrow":"Trust Center",
  "title":"Fast AI is useful. Fast AI with the wrong authority is a liability.",
  "body":"Oye !magine is built around verified identity, tenant boundaries, private assets, granular permissions, assigned approvals and evidence-gated claims. High-impact actions fail closed when the required proof is missing.",
  "primary":{"label":"Talk security","href":"/contact?interest=security"},"secondary":{"label":"See platform","href":"/platform"},
  "sections":[
   {"type":"cards","eyebrow":"Core controls","title":"What the platform enforces today.","tone":"paper","cards":[
    {"title":"Verified identity + MFA","body":"Protected surfaces resolve authenticated identity and membership; privileged roles require higher assurance."},
    {"title":"Tenant isolation","body":"Customer data, workspaces and private asset libraries are scoped by tenant and protected with database controls."},
    {"title":"Granular access","body":"Role defaults can be narrowed or extended per user. Explicit deny overrides a default grant."},
    {"title":"Provider secrecy","body":"Clients see Oye capabilities and outcomes, not internal keys, models, endpoints or vendor configuration."},
    {"title":"Approval routing","body":"Designer, digital marketer, finance and other assigned responsibilities gate the relevant high-impact actions."},
    {"title":"Commercial containment","body":"Contracts, payments, invoices, balances and spend follow evidence and approval boundaries rather than UI intent alone."}
   ]},
   {"type":"split","eyebrow":"Continuous improvement","title":"The platform may learn automatically. Production changes do not get a free pass.","body":"Prompt and workflow improvements can be evaluated and canaried automatically. Code, schema and critical guardrail changes remain release-gated with tests and rollback evidence.","bullets":["Private client truth is not copied into another client's workspace","Cross-client learning must be anonymised and evidence-backed","High-risk autonomy stays approval-bound","Every production claim needs the matching evidence state"],"tone":"ink"},
   {"type":"cta","title":"Need a procurement or security review?","body":"Ask for the current control and evidence package rather than relying on marketing adjectives.","primary":{"label":"Contact Trust team","href":"/contact?interest=security"},"tone":"yellow"}
  ]
 } $$::jsonb),
('contact','Contact','Prospective customers, partners and support','marketing','premium_cms_v1',
 '{"title":"Contact Oye !magine","description":"Tell Oye !magine what you are trying to grow, fix or build. We will route the conversation to the right operating path."}'::jsonb,
 $$ {
  "eyebrow":"Talk to Oye",
  "title":"You do not need the perfect brief. Start with the problem in your own words.",
  "body":"Tell us what the business sells, what is not working, what you want to achieve and what feels unusual. Oye can research the context, challenge weak assumptions and map the right platform, people and commercial path.",
  "badges":["New customer","Enterprise","Managed Growth","White Label","Integrations","Security review"],
  "primary":{"label":"Create a workspace","href":"/signup"},"secondary":{"label":"See pricing","href":"/pricing"},
  "sections":[
   {"type":"cards","eyebrow":"Choose a starting point","title":"We will route the rest.","tone":"paper","cards":[
    {"title":"I want to grow a brand","body":"Start with the story, category and business goal. Oye can build the initial understanding before activation.","href":"/signup","linkLabel":"Create workspace"},
    {"title":"I need an enterprise setup","body":"Discuss governance, identity, procurement, integrations, data boundaries and contracted scope."},
    {"title":"I want managed delivery","body":"Use Oye plus an assigned operating team for strategy, creative, campaigns and reporting."},
    {"title":"I am a partner","body":"Discuss Agency or White Label operating models and downstream customer workspaces."}
   ]},
   {"type":"split","eyebrow":"Useful first message","title":"What should you tell us?","body":"Nothing formal. A rough business story is enough to begin.","bullets":["What you sell and to whom","What is working today","Where growth feels stuck","What outcome matters next","Any channels, budgets or constraints already known","Anything unusual that a normal agency brief would miss"],"tone":"pink"},
   {"type":"cta","title":"Prefer to begin inside the product?","body":"Create the private workspace. Full modules remain gated until the commercial activation chain is complete.","primary":{"label":"Start securely","href":"/signup"},"tone":"yellow"}
  ]
 } $$::jsonb)
)
insert into public.cms_pages(slug,title,audience,page_type,status,layout_key,seo,visibility_rules,data,published_at,created_at,updated_at)
select slug,title,audience,page_type,'published',layout_key,seo,'{"public":true,"locale":"en-IN"}'::jsonb,data,now(),now(),now()
from seed
on conflict (slug) do update set title=excluded.title,audience=excluded.audience,page_type=excluded.page_type,status='published',layout_key=excluded.layout_key,seo=excluded.seo,visibility_rules=excluded.visibility_rules,data=excluded.data,published_at=now(),updated_at=now();

insert into public.cms_publish_versions(entity_type,entity_slug,version_label,payload,published_by,published_at)
select 'page', p.slug, 'launch-v1', to_jsonb(p), 'system_launch_seed', now()
from public.cms_pages p
where p.slug in ('about','platform','solutions','customers','integrations','marketplace','trust','contact')
and not exists (
 select 1 from public.cms_publish_versions v where v.entity_type='page' and v.entity_slug=p.slug and v.version_label='launch-v1'
);

commit;
