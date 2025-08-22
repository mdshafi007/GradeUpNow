import React from "react";

const Note = ({
  id,
  title,
  text,
  editHandler,
  deleteHandler,
  onOpen,
  createdAt,
  updatedAt,
  formatDate,
  onWikiLinkClick,
}) => {
  const escapeHtml = (unsafe) => {
    return unsafe
      .replaceAll(/&/g, "&amp;")
      .replaceAll(/</g, "&lt;")
      .replaceAll(/>/g, "&gt;")
      .replaceAll(/\"/g, "&quot;")
      .replaceAll(/'/g, "&#039;");
  };

  const renderMarkdown = (raw) => {
    const isHtml = /<[^>]+>/.test(raw || "");
    if (isHtml) {
      // If content contains HTML, sanitize it to prevent XSS and ensure proper rendering
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = raw;
      // Remove any script tags for security
      const scripts = tempDiv.querySelectorAll('script');
      scripts.forEach(script => script.remove());
      return tempDiv.innerHTML;
    }
    const escaped = escapeHtml(raw);
    // code blocks ```
    let html = escaped.replace(/```([\s\S]*?)```/g, (m, p1) => {
      return `<pre><code>${p1}</code></pre>`;
    });
    // inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // bold **text**
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // italic *text*
    html = html.replace(/\*(?!\s)([^*]+)\*/g, '<em>$1</em>');
    // highlight removed
    // headings #, ##, ### at line start
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
    // lists - item
    html = html.replace(/^(?:-\s+.+\n?)+/gm, (block) => {
      const items = block
        .trim()
        .split(/\n/)
        .map((line) => line.replace(/^[-*]\s+/, ''))
        .map((content) => `<li>${content}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    });
    // wiki links [[Title]]
    html = html.replace(/\[\[([^\]]+)\]\]/g, (m, p1) => {
      const title = p1.trim();
      return `<a href="#" class="wikilink" data-title="${title}">${title}</a>`;
    });
    // line breaks
    html = html.replace(/\n/g, '<br/>');
    return html;
  };

  const extractTags = (raw) => {
    const tags = new Set();
    const regex = /(^|\s)#([A-Za-z0-9_\-]+)/g;
    let match;
    while ((match = regex.exec(raw)) !== null) {
      tags.add(match[2]);
    }
    return Array.from(tags);
  };

  const rendered = renderMarkdown(text);
  const tags = extractTags(text);

  const handleClick = (e) => {
    const link = e.target.closest('.wikilink');
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      const t = link.getAttribute('data-title') || '';
      if (onWikiLinkClick) onWikiLinkClick(t);
      return;
    }
    if (!e.target.closest("button")) {
      onOpen(id);
    }
  };

  return (
    <div className={`note card`} onClick={handleClick}>
      {title && <div className="note-title" style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: "0.25rem" }}>{title}</div>}
      <div className="note-body" dangerouslySetInnerHTML={{ __html: rendered }}></div>
      <div className="d-flex" style={{ justifyContent: "flex-start", alignItems: "center", marginTop: "0.75rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
        <span title={`Created: ${formatDate(createdAt)}`}>Updated: {formatDate(updatedAt)}</span>
      </div>
      {tags.length > 0 && (
        <div className="d-flex" style={{ gap: "0.5rem", flexWrap: "wrap", marginTop: "0.25rem", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          {tags.map((t) => (
            <span key={t}>#{t}</span>
          ))}
        </div>
      )}
      <div
        className="note_footer d-flex align-items-center"
        style={{ justifyContent: "flex-end" }}
      >
        <button className="notesave btn me-2" onClick={() => deleteHandler(id)}>
          Delete
        </button>
        <button className="notesave btn" onClick={() => editHandler(id, text)}>
          Edit
        </button>
      </div>
    </div>
  );
};

export default Note;
