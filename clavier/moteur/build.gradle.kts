// Moteur de correction en Kotlin, sans dépendance Android : il est compilé et testé ici sur la JVM,
// puis ses sources sont copiées telles quelles dans le clavier (voir ../heliboard).
plugins {
    kotlin("jvm") version "2.2.20"
}

repositories {
    mavenCentral()
}

dependencies {
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.9.0")
    testImplementation(kotlin("test"))
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions { jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17) }
}

tasks.test {
    useJUnitPlatform()
    // Le dictionnaire est partagé avec la version JavaScript.
    systemProperty("donnees", rootDir.resolve("../../correcteur/data").canonicalPath)
    maxHeapSize = "1g"
    testLogging { events("failed"); showStandardStreams = true; exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL }
}
