package com.solveria.ai.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.lang.ArchRule;
import org.junit.jupiter.api.Test;

/**
 * Architecture tests for the AI domain module only.
 *
 * This module contains pure domain code, so the checks must stay scoped to
 * domain packages and must not assume application/api/infrastructure classes
 * are on the ai-domain test classpath.
 */
public class AiArchitectureTest {

    private final JavaClasses classes = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("com.solveria.ai.domain");

    @Test
    void domain_mustNotDependOnOtherLayers() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..domain..")
                .should().dependOnClassesThat()
                .resideInAnyPackage(
                        "..application..",
                        "..infrastructure..",
                        "..api..",
                        "..bootstrap..");

        rule.check(classes);
    }

    @Test
    void domain_mustNotDependOnSpringFramework() {
        ArchRule rule = noClasses()
                .that().resideInAPackage("..domain..")
                .should().dependOnClassesThat()
                .resideInAnyPackage(
                        "org.springframework..",
                        "jakarta.persistence..",
                        "jakarta.validation..");

        rule.check(classes);
    }

    @Test
    void domainModels_shouldStayInModelPackage() {
        ArchRule rule = classes()
                .that().resideInAPackage("..domain.model..")
                .should().beRecords()
                .orShould().haveSimpleName("Prompt")
                .orShould().haveSimpleName("Completion")
                .orShould().haveSimpleName("RagContext");

        rule.check(classes);
    }
}
