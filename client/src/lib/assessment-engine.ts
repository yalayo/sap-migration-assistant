interface AssessmentData {
  landscape?: string;
  modules?: string[];
  outcome?: string;
  customCode?: string;
  dataQuality?: string;
  dataVolume?: string;
  changeAppetite?: string;
  changeMaturity?: string;
  timeline?: string;
  budget?: string;
  orgSize?: string;
  industry?: string;
  regions?: string[];
}

export class AssessmentEngine {
  generateRecommendation(data: AssessmentData): string {
    let greenfieldScore = 0;
    let brownfieldScore = 0;
    let hybridScore = 0;

    // System Landscape Assessment
    if (data.landscape === "single") {
      brownfieldScore += 3;
      hybridScore += 1;
    } else if (data.landscape === "multiple") {
      hybridScore += 3;
      greenfieldScore += 1;
      brownfieldScore += 1;
    } else if (data.landscape === "complex") {
      greenfieldScore += 2;
      hybridScore += 3;
    }

    // Strategic Outcome Assessment
    if (data.outcome === "clean_slate") {
      greenfieldScore += 4;
    } else if (data.outcome === "preserve") {
      brownfieldScore += 4;
    } else if (data.outcome === "phased") {
      hybridScore += 4;
    }

    // Custom Code Assessment
    if (data.customCode === "preserve_all") {
      brownfieldScore += 3;
    } else if (data.customCode === "selective") {
      hybridScore += 3;
      brownfieldScore += 1;
    } else if (data.customCode === "minimize") {
      greenfieldScore += 2;
      hybridScore += 2;
    } else if (data.customCode === "eliminate") {
      greenfieldScore += 4;
    }

    // Data Quality Assessment
    if (data.dataQuality === "excellent") {
      brownfieldScore += 2;
      hybridScore += 1;
    } else if (data.dataQuality === "good") {
      brownfieldScore += 1;
      hybridScore += 2;
    } else if (data.dataQuality === "poor") {
      greenfieldScore += 2;
      hybridScore += 1;
    }

    // Data Volume Assessment
    if (data.dataVolume === "small") {
      brownfieldScore += 1;
      greenfieldScore += 1;
    } else if (data.dataVolume === "medium") {
      brownfieldScore += 2;
      hybridScore += 1;
    } else if (data.dataVolume === "large" || data.dataVolume === "enterprise") {
      hybridScore += 3;
      greenfieldScore += 1;
    }

    // Change Appetite Assessment
    if (data.changeAppetite === "minimal") {
      brownfieldScore += 3;
    } else if (data.changeAppetite === "moderate") {
      hybridScore += 3;
      brownfieldScore += 1;
    } else if (data.changeAppetite === "significant") {
      greenfieldScore += 3;
      hybridScore += 1;
    }

    // Timeline Assessment
    if (data.timeline === "6_months") {
      brownfieldScore += 3;
    } else if (data.timeline === "12_months") {
      brownfieldScore += 2;
      hybridScore += 1;
    } else if (data.timeline === "18_months") {
      hybridScore += 3;
      greenfieldScore += 1;
    } else if (data.timeline === "24_months" || data.timeline === "longer") {
      greenfieldScore += 2;
      hybridScore += 2;
    }

    // Organization Size Assessment
    if (data.orgSize === "small") {
      brownfieldScore += 2;
      greenfieldScore += 1;
    } else if (data.orgSize === "medium") {
      brownfieldScore += 1;
      hybridScore += 2;
    } else if (data.orgSize === "large" || data.orgSize === "enterprise") {
      hybridScore += 3;
      greenfieldScore += 1;
    }

    // Budget Assessment
    if (data.budget === "small") {
      brownfieldScore += 2;
    } else if (data.budget === "medium") {
      brownfieldScore += 1;
      hybridScore += 1;
    } else if (data.budget === "large" || data.budget === "enterprise") {
      greenfieldScore += 2;
      hybridScore += 2;
    }

    // Change Management Maturity
    if (data.changeMaturity === "low") {
      brownfieldScore += 2;
    } else if (data.changeMaturity === "medium") {
      hybridScore += 2;
    } else if (data.changeMaturity === "high") {
      greenfieldScore += 2;
      hybridScore += 1;
    }

    // Determine recommendation based on highest score
    const maxScore = Math.max(greenfieldScore, brownfieldScore, hybridScore);
    
    if (maxScore === greenfieldScore) {
      return "greenfield";
    } else if (maxScore === brownfieldScore) {
      return "brownfield";
    } else {
      return "hybrid";
    }
  }

  calculateScore(data: AssessmentData): number {
    let score = 0;
    let totalQuestions = 0;

    // Count completed questions and calculate readiness score
    const questions = [
      'landscape', 'outcome', 'customCode', 'dataQuality', 'dataVolume',
      'changeAppetite', 'changeMaturity', 'timeline', 'budget', 'orgSize', 'industry'
    ];

    questions.forEach(question => {
      if (data[question as keyof AssessmentData]) {
        totalQuestions++;
        
        // Add points based on readiness indicators
        if (question === 'changeMaturity' && data.changeMaturity === 'high') score += 10;
        if (question === 'dataQuality' && data.dataQuality === 'excellent') score += 10;
        if (question === 'dataQuality' && data.dataQuality === 'good') score += 7;
        if (question === 'changeAppetite' && data.changeAppetite !== 'minimal') score += 8;
        if (question === 'budget' && (data.budget === 'large' || data.budget === 'enterprise')) score += 8;
        if (question === 'timeline' && data.timeline !== '6_months') score += 5;
        
        // Base points for completion
        score += 5;
      }
    });

    // Bonus points for module diversity
    if (data.modules && data.modules.length > 3) {
      score += 10;
    } else if (data.modules && data.modules.length > 1) {
      score += 5;
    }

    // Bonus points for geographic diversity
    if (data.regions && data.regions.length > 2) {
      score += 5;
    }

    // Normalize score to 0-100 range
    const maxPossibleScore = (questions.length * 15) + 20; // Base + bonuses
    return Math.min(100, Math.round((score / maxPossibleScore) * 100));
  }

  getRecommendationRationale(data: AssessmentData, recommendation: string): string[] {
    const rationale: string[] = [];

    switch (recommendation) {
      case "greenfield":
        if (data.outcome === "clean_slate") {
          rationale.push("Clean slate approach aligns with complete re-engineering objective");
        }
        if (data.customCode === "eliminate" || data.customCode === "minimize") {
          rationale.push("Preference for standard functionality supports greenfield approach");
        }
        if (data.changeAppetite === "significant") {
          rationale.push("High change tolerance enables comprehensive transformation");
        }
        if (data.dataQuality === "poor") {
          rationale.push("Poor data quality benefits from fresh start with data cleansing");
        }
        break;

      case "brownfield":
        if (data.landscape === "single") {
          rationale.push("Single instance environment is ideal for system conversion");
        }
        if (data.outcome === "preserve") {
          rationale.push("Business process preservation aligns with conversion approach");
        }
        if (data.customCode === "preserve_all") {
          rationale.push("Desire to preserve customizations supports brownfield strategy");
        }
        if (data.timeline === "6_months" || data.timeline === "12_months") {
          rationale.push("Tight timeline favors faster conversion approach");
        }
        if (data.changeAppetite === "minimal") {
          rationale.push("Low change tolerance suits conversion with minimal disruption");
        }
        break;

      case "hybrid":
        if (data.landscape === "complex" || data.landscape === "multiple") {
          rationale.push("Complex multi-instance environment requires phased approach");
        }
        if (data.outcome === "phased") {
          rationale.push("Phased modernization objective aligns with hybrid strategy");
        }
        if (data.dataVolume === "large" || data.dataVolume === "enterprise") {
          rationale.push("Large data volume benefits from staged migration");
        }
        if (data.changeAppetite === "moderate") {
          rationale.push("Moderate change appetite aligns with selective modernization");
        }
        if (data.orgSize === "large" || data.orgSize === "enterprise") {
          rationale.push("Large organization complexity benefits from phased approach");
        }
        if (data.customCode === "selective") {
          rationale.push("Selective customization approach fits hybrid methodology");
        }
        break;
    }

    return rationale;
  }
}

export const assessmentEngine = new AssessmentEngine();
