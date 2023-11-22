

function main() {
  const urlPath = location.pathname;

  if (0 <= urlPath.indexOf("/details")) {
    pageMainForDetails();
  } else if (0 <= urlPath.indexOf("/list")) {
    pageMainForList();
  }

}

main();
