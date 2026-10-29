Enviar en https://support.github.com/contact (categoría: "Sensitive data removal" / "Removing sensitive data from a repository") o a través de https://support.github.com/contact/private-information

---

Asunto: Remove cached views and unreachable commits after history rewrite (Ronegret/rn-portfolio-2026)

Hello,

I rewrote the history of `main` in https://github.com/Ronegret/rn-portfolio-2026 to remove two files that I do not want published:

- `public/assets/linkedin/banner.html`
- `busqueda-empleo-plan.md`

I force-pushed the rewritten `main` and deleted the branches `astro-react` and `wow-integracion`, which also contained them. The repository has no pull requests (0), so there are no PR refs holding the old commits.

Please run garbage collection on the repository and remove any cached views/commits that still resolve by SHA. Old commits that contained the files:

- 1621db6d117a6ade2a621795b1fd7a1df36411bf
- 7a84a31bc8c18f4c8358b4fa0ddd26e0dcd487ae
- 1b5fa12ba53e95d08233b3268336a5b8325881b5
- 39842cac9478852b6efca08cf4ca436a75d0d5a9

Previous tip of `main` before the rewrite (descendant of those commits): e5614662c9ffc4a561b63698b36ab073d1a88348
Tip of my local pre-rewrite backup (never pushed): 429b03b0db8d3ab83564552f94d2af8e9f64e3b4

The files contain no credentials; this is a privacy/cleanliness request (personal job-search material). The repository has no forks that I know of.

Thank you,
Rodrigo Negrete (Ronegret)
