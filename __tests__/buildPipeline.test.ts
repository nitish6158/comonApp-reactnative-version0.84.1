import fs from "fs";
import path from "path";
const yaml = require("js-yaml") as { load: (content: string) => any };

const root = path.resolve(__dirname, "..");

describe("Mobile CI/CD build pipeline configuration", () => {
  it("has valid GitHub Actions workflows for quality, Android, and iOS", () => {
    const workflows = [
      ".github/workflows/ci-quality.yml",
      ".github/workflows/android-build.yml",
      ".github/workflows/ios-build.yml",
    ];

    for (const relPath of workflows) {
      const fullPath = path.join(root, relPath);
      expect(fs.existsSync(fullPath)).toBe(true);
      const parsed = yaml.load(fs.readFileSync(fullPath, "utf8")) as any;
      expect(parsed).toBeTruthy();
      expect(parsed.jobs).toBeTruthy();
    }

    const androidWf = yaml.load(
      fs.readFileSync(path.join(root, ".github/workflows/android-build.yml"), "utf8")
    ) as any;
    expect(androidWf.on.workflow_dispatch.inputs.environment.options).toEqual([
      "development",
      "staging",
      "production",
    ]);
    expect(androidWf.on.workflow_dispatch.inputs.build_type.options).toEqual([
      "apk",
      "aab",
      "both",
    ]);
    expect(androidWf.jobs["build-android"].needs).toBe("quality-gate");

    const iosWf = yaml.load(
      fs.readFileSync(path.join(root, ".github/workflows/ios-build.yml"), "utf8")
    ) as any;
    expect(iosWf.on.workflow_dispatch.inputs.build_mode.options).toEqual([
      "simulator",
      "ad-hoc",
      "app-store",
    ]);
    expect(iosWf.jobs["build-ios"].needs).toBe("quality-gate");
  });

  it("defines matching Android flavor scripts and release signing config", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(root, "package.json"), "utf8")
    );
    expect(pkg.scripts["build:android:dev"]).toContain("assembleDevelopmentDebug");
    expect(pkg.scripts["build:android:staging"]).toContain("assembleStagingDebug");
    expect(pkg.scripts["build:android:staging:release"]).toContain("assembleStagingRelease");
    expect(pkg.scripts["build:android:prod"]).toContain("assembleProductionRelease");
    expect(pkg.scripts["build:android:prod:aab"]).toContain("bundleProductionRelease");

    const gradle = fs.readFileSync(
      path.join(root, "android/app/build.gradle"),
      "utf8"
    );
    expect(gradle).toContain("MYAPP_UPLOAD_STORE_FILE");
    expect(gradle).toContain("APP_VERSION_CODE");
    expect(gradle).toContain("APP_VERSION_NAME");
    expect(gradle).toContain("signingConfig signingConfigs.release");
  });
});

