// Render images that stand alone in their paragraph as <figure>, with the image
// title (or alt text, when there is no title) as a visible caption.
export default function imageFigures(md) {
    md.core.ruler.push("image_figures", (state) => {
        const tokens = state.tokens;
        for (let i = 0; i < tokens.length - 2; i++) {
            if (tokens[i].type !== "paragraph_open" ||
                tokens[i + 1].type !== "inline" ||
                tokens[i + 2].type !== "paragraph_close") continue;

            const children = tokens[i + 1].children || [];
            const onlyImages = children.some((t) => t.type === "image") &&
                children.every((t) =>
                    t.type === "image" ||
                    t.type === "softbreak" ||
                    (t.type === "text" && !t.content.trim()));
            if (!onlyImages) continue;

            // A <figure> can't live inside a <p>, so drop the paragraph tags
            tokens[i].hidden = true;
            tokens[i + 2].hidden = true;
            children.forEach((t) => {
                if (t.type === "image") t.meta = { ...t.meta, figure: true };
            });
        }
    });

    const renderImage = md.renderer.rules.image;
    md.renderer.rules.image = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        if (!token.meta?.figure) return renderImage(tokens, idx, options, env, self);

        const alt = self.renderInlineAsText(token.children, options, env);
        const caption = token.attrGet("title") || alt;
        // The caption replaces the hover tooltip
        token.attrs = token.attrs.filter(([name]) => name !== "title");
        const img = renderImage(tokens, idx, options, env, self);
        if (!caption) return img;

        // Screen readers already announce the alt text; don't read it twice
        const ariaHidden = caption === alt ? ' aria-hidden="true"' : "";
        return `<figure>${img}<figcaption${ariaHidden}>${md.utils.escapeHtml(caption)}</figcaption></figure>`;
    };
}
