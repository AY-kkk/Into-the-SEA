import { describe, expect, it } from 'vitest';
import {
  assembleProfile,
  buildCustomProfile,
  generateResumeFollowUps,
  getProfile,
  listPositions,
  searchPositionQuestions,
} from './job-prep.service';

describe('job-prep.service', () => {
  it('lists preset positions plus custom', () => {
    const positions = listPositions();
    expect(positions.some((p) => p.id === 'custom')).toBe(true);
    expect(positions.length).toBeGreaterThan(1);
  });

  it('preset profiles expose six-output fields (five static)', () => {
    const profile = getProfile('national-admin');
    expect(profile).toBeDefined();
    expect(profile!.writtenTopics.length).toBeGreaterThan(0);
    expect(profile!.competencyModel.length).toBeGreaterThan(0);
    expect(profile!.interviewQuestions.length).toBeGreaterThan(0);
    expect(profile!.studyAdvice.length).toBeGreaterThan(0);
    expect(profile!.practicePath.length).toBeGreaterThan(0);
  });

  it('generates follow-ups covering the four types from resume points', () => {
    const followUps = generateResumeFollowUps(
      '主导校园招聘系统\n获校级奖学金\n担任学生会部长\n参与志愿服务',
      '国企管培生',
    );
    expect(followUps.length).toBe(4);
    const types = new Set(followUps.map((f) => f.type));
    expect(types).toEqual(new Set(['experience', 'motivation', 'competency', 'stress']));
  });

  it('generates fallback follow-ups when resume is empty', () => {
    const followUps = generateResumeFollowUps('', '省考基层岗');
    expect(followUps.length).toBe(4);
  });

  it('custom profile carries the given name', () => {
    const p = buildCustomProfile('数据分析岗');
    expect(p.positionName).toBe('数据分析岗');
    expect(p.positionId).toBe('custom');
  });

  it('assembleProfile includes follow-ups when resume provided', () => {
    const profile = assembleProfile('soe-product-ops', { resumeText: '负责用户增长活动' });
    expect(profile.resumeFollowUps.length).toBeGreaterThan(0);
  });

  it('searchPositionQuestions returns results with sourceUrl (red line)', async () => {
    const results = await searchPositionQuestions('国企管培生');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => Boolean(r.sourceUrl))).toBe(true);
  });
});
