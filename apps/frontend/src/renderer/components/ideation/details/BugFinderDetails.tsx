import {
  Bug,
  AlertTriangle,
  Target,
  CheckCircle,
  XCircle,
  Wrench,
  FileCode,
  ListOrdered,
  TestTube
} from 'lucide-react';
import { Badge } from '../../ui/badge';
import { Card } from '../../ui/card';
import {
  SECURITY_SEVERITY_COLORS,
  BUG_FINDER_CATEGORY_LABELS,
  BUG_FINDER_CONFIDENCE_COLORS
} from '../../../../shared/constants';
import type { BugFinderIdea } from '../../../../shared/types';

interface BugFinderDetailsProps {
  idea: BugFinderIdea;
}

export function BugFinderDetails({ idea }: BugFinderDetailsProps) {
  return (
    <>
      {/* Metrics */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="p-3 text-center">
          <div className={`text-lg font-semibold ${SECURITY_SEVERITY_COLORS[idea.severity]}`}>
            {idea.severity}
          </div>
          <div className="text-xs text-muted-foreground">Severity</div>
        </Card>
        <Card className="p-3 text-center">
          <div className={`text-lg font-semibold ${BUG_FINDER_CONFIDENCE_COLORS[idea.confidence]}`}>
            {idea.confidence}
          </div>
          <div className="text-xs text-muted-foreground">Confidence</div>
        </Card>
      </div>

      {/* Category */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Bug className="h-4 w-4" />
          Bug Category
        </h3>
        <Badge variant="outline">
          {BUG_FINDER_CATEGORY_LABELS[idea.category]}
        </Badge>
      </div>

      {/* Bug Pattern */}
      {idea.bugPattern && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-warning" />
            Bug Pattern
          </h3>
          <p className="text-sm font-mono text-muted-foreground">{idea.bugPattern}</p>
        </div>
      )}

      {/* Trigger Condition */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Target className="h-4 w-4" />
          Trigger Condition
        </h3>
        <p className="text-sm text-muted-foreground">{idea.triggerCondition}</p>
      </div>

      {/* Expected vs Actual Behavior */}
      <div className="grid grid-cols-1 gap-3">
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-success" />
            Expected Behavior
          </h3>
          <p className="text-sm text-muted-foreground">{idea.expectedBehavior}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <XCircle className="h-4 w-4 text-destructive" />
            Actual Behavior
          </h3>
          <p className="text-sm text-muted-foreground">{idea.actualBehavior}</p>
        </div>
      </div>

      {/* Reproduction Steps */}
      {idea.reproSteps && idea.reproSteps.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <ListOrdered className="h-4 w-4" />
            Reproduction Steps
          </h3>
          <ol className="space-y-1 list-decimal list-inside">
            {idea.reproSteps.map((step, i) => (
              <li key={i} className="text-sm text-muted-foreground">
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* Suggested Fix */}
      <div>
        <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
          <Wrench className="h-4 w-4" />
          Suggested Fix
        </h3>
        <p className="text-sm text-muted-foreground">{idea.suggestedFix}</p>
      </div>

      {/* Affected Files */}
      {idea.affectedFiles && idea.affectedFiles.length > 0 && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <FileCode className="h-4 w-4" />
            Affected Files
          </h3>
          <ul className="space-y-1">
            {idea.affectedFiles.map((file, i) => (
              <li key={i} className="text-sm font-mono text-muted-foreground">
                {file}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Testability */}
      {idea.testability && (
        <div>
          <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            Testability
          </h3>
          <p className="text-sm text-muted-foreground">{idea.testability}</p>
        </div>
      )}
    </>
  );
}
