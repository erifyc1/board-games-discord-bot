const mono = (text) => `\`${text.replace("`", "\\`")}\``;
const italic = (text) => `*${text.replace("*", "×")}*`;

export { mono, italic };
