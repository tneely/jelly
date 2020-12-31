export const createComment = `
mutation CreateComment($text: String!) {
  createComment(text: $text) {
    text
  }
}
`;
