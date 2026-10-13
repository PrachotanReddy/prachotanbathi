export const site = {
  name: 'Prachotan Reddy Bathi',
  shortName: 'Prachotan',
  role: 'System Architect at Arm',
  introduction: 'Platform Security. System Manageability.',
  description: 'Prachotan Reddy Bathi, System Architect at Arm. Security and manageability architecture, with interests in AI Safety, Agent Security, and Digital Literacy.',
  // Pace the rolling count across the opening; there is no pause at 100%.
  introCountMs: 3400,
  biography: [
    'I’m a System Architect at Arm. I help define security architecture and develop manageability prototypes.',
    'I work with standards bodies and open-source communities across hardware, firmware, and software. I’m also exploring AI safety and agent security.',
    'I enjoy teaching and advocate for digital literacy to address bias and barriers linked to unequal access to technology.',
  ],
  facts: [
    { label: 'Based in', value: 'Austin, Texas' },
    { label: 'Education', value: 'Computer Science', note: 'Master’s degree · University of Southern California' },
    { label: 'What I enjoy', value: 'Pickleball, Teaching, Cooking' },
  ],
  ecosystems: [
    { label: 'Standards & industry', names: ['OCP', 'TCG', 'UEFI', 'NIST'] },
    { label: 'Open-source projects', names: ['Arm Trusted Firmware', 'EDK2', 'Linux', 'OpenBMC'] },
  ],
  contactCopy: ['I welcome discussions on system security, AI safety, and digital literacy.', 'HMU to compare notes or discuss collaboration.'],
  // A mailto: or https: destination for the primary contact link.
  contactUrl: 'mailto:email@prachotanbathi.com',
  contactLabel: 'email@prachotanbathi.com',
  // Empty URLs retain the coming-soon state; Flickr is not configured yet.
  socialLinks: [
    { id: 'github', label: 'GitHub', url: 'https://github.com/PrachotanReddy' },
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/prachotanbathi' },
    { id: 'flickr', label: 'Flickr', url: '' },
  ],
};

export const projects = [
  {
    slug: 'arm-system-architecture', title: 'Arm System Architecture', animal: 'moose',
    category: 'Architecture', detailLabel: 'Hardware, firmware & software',
    color: '#e1e8d4', accent: '#53694a', phrase: 'See the whole forest.',
    summary: 'Defining interfaces and responsibilities across Arm systems.',
    description: 'My work at Arm spans the boundaries between hardware, firmware, and software. I help define system security requirements and interfaces, working with standards organizations and open-source projects to connect architectural specifications with implementation.',
    topics: ['System architecture', 'Standards', 'Open source'],
    questions: ['How do you ensure an off-the-shelf OS boots on an Arm machine?', 'Where should security responsibilities and trust boundaries sit between components?', 'How can specifications define behavior precisely enough for interoperable implementations?'],
  },
  {
    slug: 'platform-security', title: 'Platform Security', animal: 'fox',
    category: 'Security architecture', detailLabel: 'Roots of trust & attestation',
    color: '#f5d7bd', accent: '#a3522c', phrase: 'Trust starts at the roots.',
    summary: 'Roots of trust, workload isolation, and remote attestation.',
    description: 'I help define security architecture for Arm systems, including Trusted Platform Modules (TPMs), Caliptra, platform Root of Trust (pRoT), Arm Confidential Compute Architecture (CCA), and remote attestation. The architectural questions concern trust boundaries, workload isolation, and the evidence a platform provides about its state.',
    topics: ['TPM', 'Caliptra', 'xRoT', 'Arm CCA', 'Remote attestation'],
    questions: ['What assumptions underpin the root of trust, and which components remain trusted?', 'What does attestation evidence establish, and how should a verifier appraise it?', 'How do isolation and attestation address distinct parts of a system’s threat model?'],
  },
  {
    slug: 'system-manageability', title: 'System Manageability', animal: 'beaver',
    category: 'Prototyping', detailLabel: 'Management interfaces & reliability',
    color: '#e9dfc9', accent: '#80613d', phrase: 'Build. Observe. Improve.',
    summary: 'Prototyping secure management and fault handling.',
    description: 'I prototype manageability architecture for Arm systems, including baseboard management controllers (BMCs), the Security Protocol and Data Model (SPDM), and reliability, availability, and serviceability (RAS). This work connects management interfaces with platform security and fault handling.',
    topics: ['BMC', 'SPDM', 'RAS architecture', 'OpenBMC'],
    questions: ['How should a BMC communicate with an SoC and other system components?', 'How should SPDM authentication and measurements be implemented?', 'How should a system report faults, contain their effects, and support recovery (RAS)?'],
  },
  {
    slug: 'teaching-advocacy', title: 'Teaching & Advocacy', animal: 'owl',
    category: 'Founder · Linepine', detailLabel: 'Linepine · Technology education',
    color: '#d5e5ed', accent: '#486875', phrase: 'Wisdom is better shared.',
    summary: 'Bringing technology closer to children through Linepine.',
    description: 'I founded Linepine, a platform that aspires to bring technology closer to children around the world. I have run multiple summer sessions and am now looking to evolve the curriculum to make AI more accessible. This work reflects my commitment to teaching and digital literacy, with the aim of reducing barriers created by unequal access to technology.',
    topics: ['Linepine', 'Technology education', 'Digital literacy', 'AI literacy'],
    externalLink: { label: 'Visit Linepine', url: 'https://linepine.prachotanbathi.com' },
    questions: ['How can the curriculum serve children with different levels of prior knowledge and access to technology?', 'How can AI concepts be taught in ways that build understanding of both capabilities and limitations?', 'How can future sessions assess understanding and use that evidence to refine the curriculum?'],
  },
  {
    slug: 'ai-safety-security', aliases: ['ai-safety', 'ai-security'], title: 'AI Safety & Security', animal: 'duck',
    category: 'Research interest', detailLabel: 'Agent authority & evaluation',
    color: '#e9ddee', accent: '#775b7e', phrase: 'Actions need boundaries.',
    summary: 'Exploring how to constrain and evaluate AI agents.',
    description: 'I’m exploring AI safety and the security of agentic systems from a systems architecture perspective. My interests include how agents are granted access to tools and data, how that authority is constrained, and how controls can be evaluated against unintended actions and adversarial inputs.',
    topics: ['AI safety', 'AI security', 'Agentic systems'],
    questions: ['Which actions can an agent take, and what limits its authority over tools and data?', 'How can we evaluate whether controls hold under adversarial inputs and unexpected tool behavior?', 'What can an evaluation demonstrate about safety, and where does uncertainty remain?'],
  },
  {
    slug: 'hardware-enforced-ai-safety', title: 'Hardware-enforced AI Safety', animal: 'tortoise',
    category: 'Research interest', detailLabel: 'Enforcement & limits of assurance',
    color: '#dce7bb', accent: '#63713d', phrase: 'Grounded in hardware.',
    summary: 'Exploring hardware-enforced constraints on AI systems.',
    description: 'I’m interested in how hardware-enforced isolation and access controls could constrain AI systems, and what attestation could tell us about those controls. This is an exploratory interest grounded in my platform security work. I participated in the Hardware Assurance Programme’s 2026 cohort and welcome discussions with researchers in AI safety and security.',
    topics: ['Hardware isolation', 'Access control', 'Attestation'],
    questions: ['Which constraints can hardware enforce, and what assumptions do those guarantees depend on?', 'What can attestation establish about the enforcement environment and its configuration?', 'Which safety properties still require software controls or behavioral evaluation?'],
  },
];
