package it.geosolutions.geostore.services.rest.utils;

import org.springframework.expression.Expression;
import org.springframework.expression.spel.standard.SpelExpressionParser;
import org.springframework.expression.spel.support.StandardEvaluationContext;

public class SpelMapper implements GroupMapper {
    private final String expression;
    private final SpelExpressionParser parser = new SpelExpressionParser();

    public SpelMapper(String expression) {
        this.expression = expression;
    }

    @Override
    public String transform(String groupName) {
        Context context = new Context(groupName);
        Expression exp = parser.parseExpression(expression);
        StandardEvaluationContext evaluationContext = new StandardEvaluationContext(context);
        return exp.getValue(evaluationContext, String.class);
    }

    private class Context {
        private String name;

        Context(String name) {
            this.name = name;
        }

        @SuppressWarnings("unused")
        public String getName() {
            return name;
        }

        @SuppressWarnings("unused")
        public void setName(String name) {
            this.name = name;
        }
    }
}
