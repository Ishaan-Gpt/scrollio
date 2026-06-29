async function run() {
  const url = process.argv[2];
  if (!url) {
    console.error("Please provide a URL");
    process.exit(1);
  }
  const res = await fetch(url);
  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("Text length:", text.length);
  require('fs').writeFileSync('eas_build_log_clean.txt', text);
}
run();
