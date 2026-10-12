export const formatStatus = (status: string): string => {
  switch (status) {
    case "in_progress":
      return "In progress";
    case "white_won":
      return "White won";
    case "black_won":
      return "Black won";
    case "draw":
      return "Draw";
    case "abandoned":
      return "Abandoned";
    default:
      return status;
  }
}
