import { describe, expect, it } from 'vitest';
import { moderateLocal } from './index';

describe('content moderation (local)', () => {
  it('allows normal text', () => {
    const r = moderateLocal('我在基层工作三年，负责社区治理与政策宣传。');
    expect(r.action).toBe('allow');
    expect(r.text).toContain('基层工作');
  });

  it('blocks illegal exam-fraud content', () => {
    const r = moderateLocal('有没有代考服务，花钱买编制包过？');
    expect(r.action).toBe('block');
    expect(r.text).toBe('');
    expect(r.categories.length).toBeGreaterThan(0);
  });

  it('masks phone number (PII)', () => {
    const r = moderateLocal('我的手机号是 13800138000，请联系我。');
    expect(r.action).toBe('mask');
    expect(r.text).toContain('138****8000');
    expect(r.text).not.toContain('13800138000');
    expect(r.categories).toContain('phone');
  });

  it('masks 18-digit id card (PII)', () => {
    const r = moderateLocal('身份证 11010519900307617X 已提交。');
    expect(r.action).toBe('mask');
    expect(r.text).not.toContain('11010519900307617X');
    expect(r.categories).toContain('id_card');
  });

  it('masks email (PII)', () => {
    const r = moderateLocal('邮箱 zhangsan@example.com 联系。');
    expect(r.action).toBe('mask');
    expect(r.text).toContain('@example.com');
    expect(r.text).not.toContain('zhangsan@example.com');
  });

  it('block takes precedence over mask', () => {
    const r = moderateLocal('代考请打 13800138000');
    expect(r.action).toBe('block');
  });
});
