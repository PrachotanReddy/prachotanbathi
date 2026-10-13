import { projects, site } from './content.js';
import { animalArt } from './scene.js';
import { forestHero } from './forest-template.js';

export const escape = (value) => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const arrow = (direction = '') => `<svg class="icon ${direction}" aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m-6-6 6 6-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const sprout = `<svg viewBox="0 0 80 100" fill="none" aria-hidden="true"><path d="M39 92V37m0 25C10 65 5 40 10 23c22 0 32 17 29 39m0-15C38 17 58 8 73 11c4 24-10 38-34 36" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 38 39 62m19-34L39 49" stroke="currentColor" stroke-width="2"/></svg>`;
const route = (path, enhanced) => enhanced ? `#/${path}` : `#${path.startsWith('work/') ? 'topic-' + path.slice(5) : path || 'home'}`;
const linkAttrs = (path, enhanced) => `href="${route(path, enhanced)}" data-route="#/${path}"`;
const illustration = animalArt;
const topicTags = project => `<ul class="topic-tags" aria-label="Topics">${project.topics.map(topic => `<li>${escape(topic)}</li>`).join('')}</ul>`;
const projectLink = project => /^https:\/\//i.test(project.externalLink?.url || '') ? `<a class="text-link project-external-link" href="${escape(project.externalLink.url)}" target="_blank" rel="noopener noreferrer">${escape(project.externalLink.label)} ${arrow('diagonal')}<span class="sr-only"> (opens in a new tab)</span></a>` : '';
export function header(enhanced = false) {
  return `<header class="site-header flex items-center justify-between"><a class="brand" ${linkAttrs('', enhanced)} aria-label="Prachotan Reddy Bathi, home">prb<span class="brand-dot">.</span></a><nav class="flex items-center" aria-label="Main navigation"><a ${linkAttrs('about', enhanced)}>About</a><a ${linkAttrs('work', enhanced)}>Work</a><a ${linkAttrs('contact', enhanced)}>Contact ${arrow('diagonal')}</a></nav></header>`;
}
const topicLink = (project, enhanced, cls, contents, id) => `<a class="${cls}" ${linkAttrs('work/' + project.slug, enhanced)} data-focus-id="${id}" aria-label="Explore ${escape(project.title)}" style="--card-color:${project.color};--card-accent:${project.accent}">${contents}</a>`;

export function home(enhanced = false) {
  return `${forestHero(enhanced)}
  <section class="about-section section-pad" data-pointer-scene id="about" aria-labelledby="about-title" tabindex="-1">
    <div class="section-index"><span>01 / Background</span><span class="tiny-flower" data-pointer-layer="-8" aria-hidden="true">✳</span></div>
    <div class="about-grid"><div class="about-heading"><h2 id="about-title" data-letters>Curious<br><em>by nature.</em></h2></div><div class="biography">${site.biography.map(p => `<p>${escape(p)}</p>`).join('')}<a class="text-link" ${linkAttrs('contact', enhanced)}>Get in touch ${arrow('diagonal')}</a></div><dl class="about-facts">${site.facts.map(fact => `<div><dt>${escape(fact.label)}</dt><dd>${escape(fact.value)}${fact.note ? `<span>${escape(fact.note)}</span>` : ''}</dd></div>`).join('')}</dl></div>
    <div class="about-ecosystem" aria-label="Communities and projects I work with">${site.ecosystems.map(group => `<div><h3>${escape(group.label)}</h3><ul>${group.names.map(name => `<li>${escape(name)}</li>`).join('')}</ul></div>`).join('')}</div>
  </section>
  <section class="work-section section-pad" id="work" aria-labelledby="work-title" tabindex="-1">
    <div class="section-index"><span>02 / Work & interests</span><span>Six areas of work & interest.</span></div>
    <div class="work-heading"><h2 id="work-title">A different breed<br>of <em>thinking.</em></h2><p>Architecture and prototyping at Arm.<br><span>Research interests and digital literacy advocacy.</span></p></div>
    <div class="work-deck"><div class="deck-stage">${projects.map((p,i) => `<div class="work-slide"><article class="work-card" data-pointer-scene style="--card-color:${p.color};--card-accent:${p.accent}" aria-labelledby="work-title-${i}"><div class="work-card-top"><span class="work-number">0${i+1}</span><span class="topic-label">${escape(p.category)}</span></div><div class="work-card-copy"><p class="animal-phrase">${escape(p.phrase)}</p><h3 id="work-title-${i}">${escape(p.title)}</h3><p class="work-summary">${escape(p.summary)}</p>${topicLink(p, enhanced, 'work-card-link', `Read more <span class="round-arrow">${arrow('diagonal')}</span>`, 'work-' + p.slug)}</div><div class="work-illustration">${illustration(p.animal, '', false, 12)}</div><span class="card-index" aria-hidden="true">0${i+1} — 06</span></article></div>`).join('')}</div><div class="deck-controls" hidden><div class="deck-instruction"><span>Swipe to explore the topics ${arrow()}</span><span class="deck-counter" aria-hidden="true">01 / 06</span></div><div class="deck-picker" role="group" aria-label="Choose an area of work or interest">${projects.map((p,i) => `<button class="deck-pick" type="button" data-slide="${i}" data-focus-id="pick-${p.slug}" aria-label="Show ${escape(p.title)}" aria-pressed="${i === 0}" style="--card-color:${p.color}">${illustration(p.animal)}</button>`).join('')}</div><span class="deck-announcer sr-only" role="status" aria-live="polite" aria-atomic="true"></span></div></div>
    <div class="work-bottom"><span>Open to technical discussion and collaboration.</span><a class="text-link" ${linkAttrs('contact', enhanced)}>Discuss a topic ${arrow('diagonal')}</a></div>
  </section>
  ${contact(enhanced)}
  ${enhanced ? '' : `<div class="static-details section-pad"><h2>Work & interests</h2>${projects.map(p => `<article id="topic-${p.slug}" class="static-topic"><p class="topic-label">${escape(p.category)}</p><h3>${escape(p.title)}</h3><p>${escape(p.description)}</p>${topicTags(p)}${projectLink(p)}<h4>Questions & considerations</h4><ul>${p.questions.map(q => `<li>${escape(q)}</li>`).join('')}</ul><a href="#work">Back to all topics</a></article>`).join('')}</div>`}`;
}

function contact(enhanced) {
  const validContact = /^(mailto:|https:\/\/)/i.test(site.contactUrl);
  const external = /^https:\/\//i.test(site.contactUrl);
  const github = site.socialLinks.find(link => link.id === 'github' && /^https:\/\//i.test(link.url));
  return `<footer class="contact-section section-pad" data-pointer-scene id="contact" aria-labelledby="contact-title" tabindex="-1"><div class="section-index"><span>03 / Start a conversation</span>${sprout}</div><div class="contact-grid"><div><p class="contact-pretitle">Chilled Bear?</p><h2 id="contact-title">Let’s talk<span>.</span></h2><p class="contact-copy">${site.contactCopy.map(escape).join('<br>')}</p><div class="contact-actions">${validContact ? `<a class="contact-link" data-magnetic href="${escape(site.contactUrl)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(site.contactLabel)} ${arrow('diagonal')}${external ? '<span class="sr-only"> (opens in a new tab)</span>' : ''}</a>` : '<p class="contact-pending"><span aria-hidden="true"></span>Contact details coming soon</p>'}${github ? `<a class="text-link contact-secondary" href="${escape(github.url)}" target="_blank" rel="noopener noreferrer">Find me on GitHub ${arrow('diagonal')}<span class="sr-only"> (opens in a new tab)</span></a>` : ''}</div></div><div class="bear-illustration" data-pointer-layer="16">${illustration('bear')}</div></div><div class="footer-bottom"><a class="footer-name" ${linkAttrs('', enhanced)}>${escape(site.name)}</a><span>Architecture · Security · Education</span><a class="back-top" ${linkAttrs('', enhanced)}>Back to top ${arrow('up')}</a></div></footer>`;
}

export function detail(project) {
  const index = projects.indexOf(project);
  const previous = projects[(index + projects.length - 1) % projects.length];
  const next = projects[(index + 1) % projects.length];
  return `<article class="detail-page" style="--card-color:${project.color};--card-accent:${project.accent}"><div class="detail-top"><a class="text-link" href="#/work" data-route="#/work">${arrow('back')} All topics</a><span>0${index+1} / 06</span></div><div class="detail-hero" data-pointer-scene><div class="detail-intro"><p class="topic-label">${escape(project.category)}</p><h1 tabindex="-1" id="detail-title">${escape(project.title)}</h1><p class="animal-phrase">${escape(project.phrase)}</p></div><div class="detail-art" data-pointer-layer="18">${illustration(project.animal, '', true)}</div></div><div class="detail-body section-pad"><div><span class="section-label">${escape(project.detailLabel)}</span><h2>${escape(project.summary)}</h2>${topicTags(project)}${projectLink(project)}</div><div><p class="detail-description">${escape(project.description)}</p><h3>Questions & considerations</h3><ol class="question-list">${project.questions.map((q,i) => `<li><span>0${i+1}</span>${escape(q)}</li>`).join('')}</ol></div></div><nav class="detail-nav" aria-label="Other areas of work and interest"><a href="#/work/${previous.slug}" data-route="#/work/${previous.slug}">${arrow('back')}<span><small>Previous topic</small>${escape(previous.title)}</span></a><a href="#/work/${next.slug}" data-route="#/work/${next.slug}"><span><small>Next topic</small>${escape(next.title)}</span>${arrow()}</a></nav></article>${contact(true)}`;
}

export function loader() {
  return `<svg class="clip-defs" aria-hidden="true"><defs><clipPath id="curtain-clip" clipPathUnits="objectBoundingBox"><path id="curtain-path" d="M0 0H1V1H0Z"/></clipPath></defs></svg><div id="preloader" class="preloader" aria-hidden="true"><div class="loader-wordmark">prb.</div><div class="loader-main">${illustration('cow', '', true)}<h2>Cowdy<span>?</span></h2><p>Loading the portfolio.</p></div><div class="loader-bottom"><span>Make yourself at home.</span><div class="loading-count"><div class="rolling-counter">${[0,1,2].map(() => `<span class="digit-window"><span class="digit-reel">${Array.from({length:11},(_,i) => `<span>${i % 10}</span>`).join('')}</span></span>`).join('')}</div><span class="percent">%</span></div></div></div>`;
}
