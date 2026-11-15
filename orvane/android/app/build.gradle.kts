plugins {
    id("com.android.application")
}

// Numéro de version : celui de la construction sur GitHub (GITHUB_RUN_NUMBER), 1 en local.
val construction = (System.getenv("GITHUB_RUN_NUMBER") ?: "1").toInt()

android {
    namespace = "fr.orvane.prototype"
    compileSdk = 35

    defaultConfig {
        applicationId = "fr.orvane.prototype"
        minSdk = 26
        targetSdk = 35
        versionCode = construction
        versionName = "0.1.$construction"
    }

    // Signature : sur GitHub, une clé stable (gardée dans le cache des Actions, jamais dans le dépôt) pour que chaque
    // nouvelle version s'installe par-dessus l'ancienne sans perdre la sauvegarde. En local, la clé de débogage.
    val cle = System.getenv("ORVANE_CLE")
    signingConfigs {
        if (cle != null) {
            create("orvane") {
                storeFile = file(cle)
                storePassword = System.getenv("ORVANE_MOT_DE_PASSE")
                keyAlias = "orvane"
                keyPassword = System.getenv("ORVANE_MOT_DE_PASSE")
            }
        }
    }

    buildTypes {
        getByName("release") {
            isMinifyEnabled = false
            signingConfig = if (cle != null) signingConfigs.getByName("orvane") else signingConfigs.getByName("debug")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    // aligne les morceaux de la bibliothèque Kotlin tirés par AndroidX (sinon : classes en double)
    implementation(platform("org.jetbrains.kotlin:kotlin-bom:1.8.22"))
    implementation("androidx.webkit:webkit:1.12.1")
    implementation("androidx.activity:activity:1.9.3")
}

// Avant chaque construction, le jeu (page, moteur, grimoire, prototype, Phaser et polices) est copié dans les assets.
val preparerJeu by tasks.registering(Exec::class) {
    group = "orvane"
    description = "Copie le jeu, Phaser et les polices dans app/src/main/assets/www"
    workingDir = rootDir
    commandLine("bash", "web/preparer-www.sh")
}
tasks.named("preBuild") { dependsOn(preparerJeu) }
