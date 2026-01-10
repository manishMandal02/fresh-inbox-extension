export const format = {
  /**
   * Generate a consistent color from a string.
   */
  stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00ffffff).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  },
  
  /**
   * Gmail-like palette
   */
  avatarColor(str: string): string {
    const colors = [
      '#ef5350', '#ec407a', '#ab47bc', '#7e57c2', '#5c6bc0',
      '#42a5f5', '#29b6f6', '#26c6da', '#26a69a', '#66bb6a',
      '#9ccc65', '#d4e157', '#ffee58', '#ffca28', '#ffa726',
      '#ff7043', '#8d6e63', '#bdbdbd', '#78909c'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
};