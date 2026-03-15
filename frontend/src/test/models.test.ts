import { describe, it, expect } from 'vitest';
import { SkillLevel, UserRole } from '../app/api/index';

describe('Pickolo Data Models', () => {
  it('should have correct SkillLevel definitions', () => {
    expect(SkillLevel.BEGINNER).toBe('Beginner');
    expect(SkillLevel.INTERMEDIATE).toBe('Intermediate');
    expect(SkillLevel.EXPERT).toBe('Expert');
  });

  it('should have correct UserRole definitions', () => {
    expect(UserRole.PLAYER).toBe('Player');
    expect(UserRole.MANAGER).toBe('Manager');
  });
});
