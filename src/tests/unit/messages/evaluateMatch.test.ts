import { describe, expect, test } from "vitest";

import { evaluateMatch } from "../../../messages/evaluateMatch";
import { createMockCondition, createMockMessage } from "./helpers";

describe("evaluateMatch", () => {
  describe("conditions of type term", () => {
    test("includes and excludes are empty -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: [],
        exclude: [],
      });
      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(false);
    });

    test("message content contains include term as substring -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["hello"],
        exclude: [],
      });
      const message = createMockMessage({
        content: "well hello there",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });

    test("message content does not contain include term -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["hello"],
        exclude: [],
      });
      const message = createMockMessage({
        content: "world",
        authorId: "123",
      });
      const result = evaluateMatch(condition, message);
      expect(result).toBe(false);
    });

    test("message content contains exclude term -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: [],
        exclude: ["hello"],
      });
      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(false);
    });

    test("message content does not contain exclude term -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: [],
        exclude: ["hello"],
      });
      const message = createMockMessage({
        content: "world",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });

    test("message content contains one of multiple include terms -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["urgent", "invoice"],
        exclude: [],
      });
      const message = createMockMessage({
        content: "new invoice posted",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });

    test("message content contains include and exclude terms -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["invoice"],
        exclude: ["paid"],
      });
      const message = createMockMessage({
        content: "invoice already paid",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(false);
    });

    test("message content contains include term and no exclude terms -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["invoice"],
        exclude: ["paid"],
      });
      const message = createMockMessage({
        content: "invoice is ready",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });
  });

  describe("conditions of type any", () => {
    test("ignores message content -> return true", () => {
      const condition = createMockCondition({
        type: "ANY",
      });
      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });
  });

  describe("conditions with targets", () => {
    test("message author is in target users -> return true", () => {
      const condition = createMockCondition({
        targetUsers: ["123"],
      });
      const message = createMockMessage({
        content: "",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });

    test("message author is not in target users -> return false", () => {
      const condition = createMockCondition({
        targetUsers: ["123"],
      });
      const message = createMockMessage({
        content: "",
        authorId: "456",
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(false);
    });

    test("message author has target role -> return true", () => {
      const condition = createMockCondition({
        targetRoles: ["123"],
      });
      const message = createMockMessage({
        content: "",
        authorId: "123",
        roleIds: ["123"],
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(true);
    });

    test("message author does not have any target roles -> return false", () => {
      const condition = createMockCondition({
        targetRoles: ["123"],
      });
      const message = createMockMessage({
        content: "",
        authorId: "123",
        roleIds: ["456"],
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(false);
    });

    test("message author has one of multiple target roles -> return true", () => {
      const condition = createMockCondition({
        targetRoles: ["admin", "mod"],
      });

      const message = createMockMessage({
        content: "",
        authorId: "123",
        roleIds: ["mod"],
      });

      expect(evaluateMatch(condition, message)).toBe(true);
    });

    test("message has target role but no member data -> return false", () => {
      const condition = createMockCondition({
        targetRoles: ["123"],
      });
      const message = createMockMessage({
        content: "",
        authorId: "123",
        hasMember: false,
        roleIds: ["123"],
      });

      const result = evaluateMatch(condition, message);

      expect(result).toBe(false);
    });
  });

  describe("case sensitivity", () => {
    test("case sensitive is true and message content includes term -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["Hello"],
        sensitive: true,
      });

      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(false);
    });

    test("case sensitive is false and message content includes term -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        include: ["Hello"],
        sensitive: false,
      });

      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(true);
    });

    test("case sensitive is true and message content contains exclude term with different casing -> return true", () => {
      const condition = createMockCondition({
        type: "TERM",
        exclude: ["Hello"],
        sensitive: true,
      });

      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(true);
    });

    test("case sensitive is false and message content contains exclude term with different casing -> return false", () => {
      const condition = createMockCondition({
        type: "TERM",
        exclude: ["Hello"],
        sensitive: false,
      });

      const message = createMockMessage({
        content: "hello",
        authorId: "123",
      });

      const result = evaluateMatch(condition, message);
      expect(result).toBe(false);
    });
  });
});
