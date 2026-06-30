const { withSettingsGradle, withAppBuildGradle } = require("@expo/config-plugins");

module.exports = function withAndroidSymlinkFix(config) {
  // 1. Fix settings.gradle to resolve canonical paths of native modules in pnpm workspace
  config = withSettingsGradle(config, (config) => {
    if (!config.modResults.contents.includes("canonicalFile")) {
      config.modResults.contents += `
// Resolve symlinks for subprojects in pnpm workspace to prevent Gradle "No variants exist" errors
rootProject.children.each { project ->
  if (project.projectDir.exists()) {
    project.projectDir = project.projectDir.canonicalFile
  }
}
`;
    }
    return config;
  });

  // 2. Fix app/build.gradle to handle space-in-path on Windows machines if running locally
  config = withAppBuildGradle(config, (config) => {
    let contents = config.modResults.contents;
    
    // Add rawProjectRoot and shortRootDir definitions to handle "Ishaan GPT" space-in-path issue on Windows
    if (!contents.includes("shortRootDir")) {
      const target = 'apply plugin: "com.facebook.react"';
      const replacement = `apply plugin: "com.facebook.react"

def rawProjectRoot = rootDir.getAbsoluteFile().getParentFile().getAbsolutePath()
def projectRoot = rawProjectRoot.replace("Ishaan GPT", "ISHAAN~1")
def shortRootDir = new File(rootDir.getAbsolutePath().replace("Ishaan GPT", "ISHAAN~1"))`;
      contents = contents.replace(target, replacement);
    }

    // Replace react block entry file resolving with Windows short path aware version
    if (contents.includes("entryFile = file(")) {
      contents = contents.replace(
        /entryFile = file\(.*resolveAppEntry.*?\)/,
        `entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", projectRoot, "android", "absolute"].execute(null, shortRootDir).text.trim().replace("Ishaan GPT", "ISHAAN~1"))`
      );
    }

    // Replace root project directory path with short path aware version
    if (contents.includes("root = file(")) {
      contents = contents.replace(
        /root = file\("\.\.\/\.\."\)/,
        `root = new File(file("../..").getAbsolutePath().replace("Ishaan GPT", "ISHAAN~1"))`
      );
    }

    config.modResults.contents = contents;
    return config;
  });

  return config;
};
